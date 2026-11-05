import {waveBuffer,amplitudeEnvelope} from './audio';
export {amplitudeEnvelope} from './audio';
import {readVoiceConfig,elevenSpeech} from './elevenlabs';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {neuralReady,neuralSpeech} from './neural';

export type Speaker = 'PALITO' | 'TICO';
export type SpeechResult = {
  duration: number;
  envelope: number[];
  sampleRate: number;
  engine: string;
  voice: string;
};

/** A future local neural/cloud provider must return real audio with measured timing. */
export interface SpeechProvider {
  synthesize(text: string, speaker: Speaker, outputPath: string): Promise<SpeechResult>;
}

const profiles = {
  PALITO: {voice: 'pt-br+m3', pitch: 43, range: 65, rate: 155},
  TICO: {voice: 'pt-br+f3', pitch: 55, range: 35, rate: 150},
} as const;

interface Worker {
  set_voice(name: string): number;
  set_rate(value: number): void;
  set_pitch(value: number): void;
  set_range(value: number): void;
  set_volume(value: number): void;
  get_samplerate(): number;
  list_voices(): {languages: {name: string}[]}[];
  synthesize(text: string, callback: (samples: Int16Array) => boolean): void;
}
let workerPromise: Promise<Worker> | undefined;
const installation = 'Na pasta do PALITO SHOW, execute npm ci e reinicie o servidor. As vozes são instaladas junto com o aplicativo; não exigem conta ou API.';

async function worker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      // The package includes its compiled engine and language/variant data. No runtime network calls.
      const packageName = '@echogarden/espeak-ng-emscripten';
      const {default: createModule} = await import(packageName);
      const module = await createModule();
      const instance: Worker = new module.eSpeakNGWorker();
      if (!instance.list_voices().some(v => v.languages.some(l => l.name.toLowerCase() === 'pt-br'))) {
        throw new Error('Dados de português brasileiro não encontrados.');
      }
      for (const profile of Object.values(profiles)) {
        if (instance.set_voice(profile.voice) !== 0) throw new Error('Uma das duas vozes locais não foi encontrada.');
      }
      return instance;
    })().catch(() => {
      workerPromise = undefined;
      throw new Error(`Vozes locais indisponíveis. ${installation}`);
    });
  }
  return workerPromise;
}

export async function voiceStatus() {
 const config=await readVoiceConfig();if(config.provider==='elevenlabs')return {ready:Boolean(config.apiKey&&config.palito&&config.tica),engine:'elevenlabs',voices:[{character:'PALITO',voice:config.palito||'',language:'pt-BR'},{character:'TICO',voice:config.tica||'',language:'pt-BR'}],error:config.apiKey&&config.palito&&config.tica?undefined:'Configure a chave e as duas vozes em Configurações.'};
  if(await neuralReady())return {ready:true,engine:'kokoro-onnx',quality:'Vozes neurais locais em português brasileiro.',voices:[{character:'PALITO',voice:'pm_alex',language:'pt-BR'},{character:'TICO',voice:'pf_dora',language:'pt-BR'}],installation:'Vozes neurais instaladas. Execute TESTAR-VOZES.cmd para ouvir novamente.'};
  const details = {
    engine: 'espeak-ng',
    quality: 'Vozes sintéticas locais com timbre robótico; não são vozes neurais.',
    voices: Object.entries(profiles).map(([character, p]) => ({character, voice: p.voice, language: 'pt-BR'})),
    installation,
  };
  try {
    await worker();
    return {ready: true, ...details};
  } catch (error) {
    return {ready: false, ...details, error: (error as Error).message};
  }
}

export async function synthesize(text: string, speaker: Speaker, outputPath: string): Promise<SpeechResult> {
  const line = text.trim();
  if (!line || line.length > 500) throw new Error('A fala deve conter entre 1 e 500 caracteres.');
  if (!(speaker in profiles)) throw new Error('Personagem sem voz configurada.');
  const config=await readVoiceConfig();if(config.provider==='elevenlabs')return elevenSpeech(line,speaker,outputPath,config);
  if(await neuralReady())return neuralSpeech(line,speaker,outputPath);
  const engine = await worker();
  const profile = profiles[speaker];
  if (engine.set_voice(profile.voice) !== 0) throw new Error(`A voz de ${speaker} não está instalada. ${installation}`);
  engine.set_rate(profile.rate); engine.set_pitch(profile.pitch);
  engine.set_range(profile.range); engine.set_volume(100);
  const chunks: Int16Array[] = [];
  // eSpeak's API is synchronous. Copy each callback buffer before it is reused.
  engine.synthesize(line, samples => { if (samples.length) chunks.push(samples.slice()); return false; });
  const length = chunks.reduce((n, samples) => n + samples.length, 0);
  if (!length) throw new Error(`Não foi possível gerar a fala de ${speaker}.`);
  const samples = new Int16Array(length);
  let cursor = 0;
  for (const chunk of chunks) { samples.set(chunk, cursor); cursor += chunk.length; }
  const sampleRate = engine.get_samplerate();
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  if (peak < 100) throw new Error(`A fala de ${speaker} ficou silenciosa. Tente novamente.`);
  // Limit amplification to avoid bringing up noise while leaving headroom for effects.
  const gain = Math.min(2, 28000 / peak);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.round(samples[i] * gain);
  await mkdir(path.dirname(outputPath), {recursive: true});
  await writeFile(outputPath, waveBuffer(samples, sampleRate), {flag: 'wx'});
  return {duration: length / sampleRate, envelope: amplitudeEnvelope(samples, sampleRate), sampleRate, engine: 'espeak-ng', voice: profile.voice};
}

export const localSpeechProvider: SpeechProvider = {synthesize};
