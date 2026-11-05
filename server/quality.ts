import {wavePcm} from './audio';
import {execFile} from 'node:child_process';
import {stat} from 'node:fs/promises';
import {promisify} from 'node:util';
import type {Narration} from '../src/narration';
import {mediaExecutable} from './runtime';
const execute = promisify(execFile);
const FPS = 30;

export type QualityReport = {
  checkedAt: string;
  bytes: number;
  duration: number;
  codec: string;
  resolution: string;
  audioCodec: string;
  decodedCompletely: boolean;
  blackIntervals: number;
  speech: {scene: number; rms: number; voicedFrames: number; audibleVoicedFrames: number}[];
  images: {scene: number; darkFraction: number; deviation: number}[];
  limitation: string;
};

/** Check the same frame boundaries used by captions, mouths and audio. */
export function validateTiming(narration: Narration, durationSeconds: number): void {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 ||
      narration.durationInFrames !== Math.round(durationSeconds * FPS) || !narration.scenes.length) {
    throw new Error('A duração do vídeo não corresponde à linha do tempo das falas.');
  }
  let previous = 0;
  for (const [index, scene] of narration.scenes.entries()) {
    const boundaries = [scene.start, scene.end, scene.audioStart, scene.audioEnd];
    if (boundaries.some(n => !Number.isInteger(n)) || scene.start !== previous ||
        scene.audioStart < scene.start || scene.audioEnd <= scene.audioStart ||
        scene.audioEnd > scene.end || scene.end > narration.durationInFrames ||
        !scene.envelope.length || scene.envelope.some(n => !Number.isFinite(n) || n < 0 || n > 1) ||
        scene.envelope.length > scene.audioEnd - scene.audioStart + 1) {
      throw new Error(`A fala da cena ${index + 1} está fora do tempo reservado ou possui dados inválidos.`);
    }
    previous = scene.end;
  }
  if (previous !== narration.durationInFrames) throw new Error('Há uma lacuna no final da composição.');
  if(narration.reaction){
    const reaction=narration.reaction,last=narration.scenes.at(-1)!;
    if(!Number.isInteger(reaction.start)||!Number.isInteger(reaction.end)||reaction.start<last.audioEnd||reaction.end<=reaction.start||reaction.end>last.end||!reaction.src||!reaction.envelope.length||reaction.envelope.length>reaction.end-reaction.start||reaction.envelope.some(n=>!Number.isFinite(n)||n<0||n>1)){
      throw new Error('A risada está fora do tempo reservado ou possui dados inválidos.');
    }
  }
}

export function inspectSpeech(pcm: Buffer, narration: Narration, rate = 8000): QualityReport['speech'] {
  const sampleCount = pcm.length / 2;
  return narration.scenes.map((scene, index) => {
    const from = Math.floor(scene.audioStart / FPS * rate);
    const to = Math.min(sampleCount, Math.ceil(scene.audioEnd / FPS * rate));
    let sum = 0;
    for (let i = from; i < to; i++) sum += (pcm.readInt16LE(i * 2) / 32768) ** 2;
    const rms = Math.sqrt(sum / Math.max(1, to - from));
    let voicedFrames = 0, audibleVoicedFrames = 0;
    scene.envelope.forEach((energy, frame) => {
      if (energy < .12) return;
      voicedFrames++;
      const first = Math.floor((scene.audioStart + frame) / FPS * rate);
      const last = Math.min(sampleCount, Math.floor((scene.audioStart + frame + 1) / FPS * rate));
      let frameEnergy = 0;
      for (let sample = first; sample < last; sample++) frameEnergy += (pcm.readInt16LE(sample * 2) / 32768) ** 2;
      if (Math.sqrt(frameEnergy / Math.max(1, last - first)) > .0008) audibleVoicedFrames++;
    });
    // Effects start before speech; compare expected voiced frames against the
    // actual decoded MP4 rather than accepting a soundtrack containing only pops.
    if (to <= from || rms < .001 || voicedFrames === 0 || audibleVoicedFrames / voicedFrames < .75) {
      throw new Error(`A voz da cena ${index + 1} está ausente, silenciosa ou fora de sincronia no MP4.`);
    }
    return {scene: index + 1, rms, voicedFrames, audibleVoicedFrames};
  });
}

export async function validateMovie(file: string, durationSeconds: number, narration: Narration): Promise<QualityReport> {
  validateTiming(narration, durationSeconds);
  const info = await stat(file).catch(() => { throw new Error('O renderizador não criou o arquivo MP4.'); });
  if (info.size < 1024) throw new Error('O MP4 está vazio ou incompleto.');
  const ffprobe = mediaExecutable('ffprobe');
  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
  const run = (command: string, args: string[]) => execute(command, args, {timeout: 120000, maxBuffer: 8 * 1024 * 1024, windowsHide: true});
  try {
    const {stdout} = await run(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]);
    const probe = JSON.parse(stdout);
    const video = probe.streams?.find((s: {codec_type: string}) => s.codec_type === 'video');
    const audio = probe.streams?.find((s: {codec_type: string}) => s.codec_type === 'audio');
    const [numerator, denominator] = String(video?.avg_frame_rate || '0/1').split('/').map(Number);
    if (!video || video.codec_name !== 'h264' || video.width !== 1080 || video.height !== 1920 ||
        Math.abs(numerator / denominator - FPS) > .001 ||
        !Number.isFinite(Number(video.duration)) || Math.abs(Number(video.duration) - durationSeconds) > 1 / FPS) {
      throw new Error('O MP4 não corresponde a H.264, 1080 × 1920, 30 FPS e à duração prevista.');
    }
    if (!audio || !Number.isFinite(Number(audio.duration)) || Number(audio.duration) + .1 < durationSeconds) {
      throw new Error('A faixa de áudio está ausente ou terminou antes do vídeo.');
    }
    // Always check actual speech, including Windows without a system FFmpeg.
    const bundledAudio=await execute(mediaExecutable('ffmpeg'),['-v','error','-i',file,'-vn','-ac','1','-ar','8000','-acodec','pcm_s16le','-f','wav','pipe:1'],{encoding:'buffer',timeout:120000,maxBuffer:8*1024*1024,windowsHide:true});
    const verifiedSpeech=inspectSpeech(wavePcm(bundledAudio.stdout),narration);
    const deepCheckAvailable=await run(ffmpeg,['-version']).then(()=>true).catch(error=>{
      if((error as NodeJS.ErrnoException).code==='ENOENT')return false;
      throw error;
    });
    if(!deepCheckAvailable){
      return {
        checkedAt:new Date().toISOString(),bytes:info.size,duration:Number(video.duration),codec:video.codec_name,
        resolution:`${video.width}x${video.height}`,audioCodec:audio.codec_name,decodedCompletely:false,
        blackIntervals:0,speech:verifiedSpeech,images:[],
        limitation:'Codec, resolução, duração e falas audíveis foram verificados. A decodificação profunda requer FFmpeg no PATH; o MP4 foi preservado para reprodução e revisão manual.',
      };
    }
    // The FFmpeg binary bundled by Remotion is intentionally minimal and does
    // not include blackdetect. Decode every frame here; sampled frames below
    // still reject empty, dark or missing character compositions.
    await run(ffmpeg, ['-v', 'error', '-xerror', '-i', file, '-f', 'null', '-']);
    const blackIntervals = 0;
    const decoded = await execute(ffmpeg, ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', '8000', '-f', 's16le', 'pipe:1'],
      {encoding: 'buffer', timeout: 120000, maxBuffer: 8 * 1024 * 1024, windowsHide: true});
    const speech = inspectSpeech(decoded.stdout, narration);
    const images: QualityReport['images'] = [];
    for (const [index, scene] of narration.scenes.entries()) {
      const timestamp = (scene.audioStart + Math.min(20, (scene.audioEnd - scene.audioStart) / 2)) / FPS;
      const {stdout: pixels} = await execute(ffmpeg, ['-v', 'error', '-ss', String(timestamp), '-i', file, '-frames:v', '1', '-vf', 'crop=880:520:100:750,scale=110:65,format=gray', '-f', 'rawvideo', 'pipe:1'],
        {encoding: 'buffer', timeout: 120000, maxBuffer: 1024 * 1024, windowsHide: true});
      if (pixels.length !== 110 * 65) throw new Error(`Não foi possível ler a imagem da cena ${index + 1}.`);
      let sum = 0, squares = 0, dark = 0;
      for (const value of pixels) { sum += value; squares += value * value; if (value < 100) dark++; }
      const deviation = Math.sqrt(Math.max(0, squares / pixels.length - (sum / pixels.length) ** 2));
      const darkFraction = dark / pixels.length;
      if (deviation < 12 || darkFraction < .003 || darkFraction > .7) {
        throw new Error(`A cena ${index + 1} parece vazia, escura ou sem os traços esperados. Confira a composição.`);
      }
      images.push({scene: index + 1, darkFraction, deviation});
    }
    return {
      checkedAt: new Date().toISOString(), bytes: info.size, duration: Number(video.duration),
      codec: video.codec_name, resolution: `${video.width}x${video.height}`, audioCodec: audio.codec_name,
      decodedCompletely: true, blackIntervals, speech, images,
      limitation: 'As imagens são amostradas na região dos personagens em cada cena; contraste e traços são verificados, sem reconhecimento visual semântico. A voz é comparada ao envelope, sem transcrição de palavras.',
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('O verificador de metadados do vídeo não foi encontrado. Execute npm ci novamente.');
    }
    if (typeof (error as NodeJS.ErrnoException).code === 'number') {
      throw new Error('O MP4 falhou na leitura ou decodificação com FFmpeg/FFprobe. Tente gerar novamente.');
    }
    throw error;
  }
}
