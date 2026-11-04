import type {Project} from './model';

export const NARRATION_FPS = 30;
export const SPEECH_PREROLL_FRAMES = 6;
export const MIN_SPEECH_PAUSE_FRAMES = 12;
export const REACTION_GAP_FRAMES = 6;

export type NarrationScene = {
  start: number;
  end: number;
  audioStart: number;
  audioEnd: number;
  src: string;
  envelope: number[];
  speaker: 'PALITO' | 'TICO';
};

export type Narration = {
  durationInFrames: number;
  scenes: NarrationScene[];
  reaction?: NarrationReaction;
};

export type NarrationReaction={start:number;end:number;src:string;envelope:number[];speaker:'PALITO'|'TICO'};

export type NarrationClip = {
  duration: number;
  src: string;
  /** One normalized amplitude sample per video frame, relative to audio start. */
  envelope: number[];
};

/** Build one timeline for preview, subtitles, character poses, speech and export.
 * Speech is never sped up or truncated. A caller must select/rewrite a shorter
 * script when the complete recordings and their pauses do not fit.
 */
export function buildNarration(project: Project, clips: NarrationClip[], reactionClip?:NarrationClip): Narration {
  if (clips.length !== project.scenes.length || clips.length === 0) {
    throw new Error('Cada cena precisa de uma fala gravada antes da renderização.');
  }
  const lengths = clips.map(clip => {
    if (!Number.isFinite(clip.duration) || clip.duration <= 0 || !clip.src ||
        !clip.envelope.length || clip.envelope.some(n => !Number.isFinite(n) || n < 0 || n > 1)) {
      throw new Error('Áudio inválido: duração, arquivo ou envelope de voz ausente.');
    }
    // Rounding upward protects the last partial frame of the spoken recording.
    return Math.ceil(clip.duration * NARRATION_FPS);
  });
  const durationInFrames = project.duration * NARRATION_FPS;
  const reactionLength=reactionClip?Math.ceil(reactionClip.duration*NARRATION_FPS):0;
  if(reactionClip&&(!reactionClip.src||!reactionClip.envelope.length||reactionClip.envelope.some(n=>!Number.isFinite(n)||n<0||n>1))){
    throw new Error('Áudio de reação inválido.');
  }
  const minimum = lengths.reduce((sum, length) => sum + length + SPEECH_PREROLL_FRAMES + MIN_SPEECH_PAUSE_FRAMES, 0)+(reactionClip?REACTION_GAP_FRAMES+reactionLength:0);
  if (minimum > durationInFrames) {
    throw new Error(`As falas completas precisam de pelo menos ${(minimum / NARRATION_FPS).toFixed(1)} segundos. Gere um roteiro mais curto ou escolha 30 segundos; nenhuma fala será cortada ou acelerada.`);
  }
  const extra = durationInFrames - minimum;
  const holdPerScene = Math.min(6, Math.floor(extra / clips.length));
  let cursor = 0;
  let reaction:NarrationReaction|undefined;
  const scenes = clips.map((clip, index): NarrationScene => {
    const start = cursor;
    const audioStart = start + SPEECH_PREROLL_FRAMES;
    const audioEnd = audioStart + lengths[index];
    const hold = index===clips.length-1 ? extra-holdPerScene*(clips.length-1) : holdPerScene;
    if(reactionClip&&index===clips.length-1){
      const reactionStart=audioEnd+REACTION_GAP_FRAMES;
      reaction={start:reactionStart,end:reactionStart+reactionLength,src:reactionClip.src,envelope:[...reactionClip.envelope],speaker:'TICO'};
      cursor=reaction.end+MIN_SPEECH_PAUSE_FRAMES+hold;
    }else cursor = audioEnd + MIN_SPEECH_PAUSE_FRAMES + hold;
    return {
      start, end: cursor, audioStart, audioEnd,
      src: clip.src,
      envelope: [...clip.envelope],
      speaker: project.scenes[index].speaker,
    };
  });
  return {durationInFrames, scenes, reaction};
}

export function narrationMouthAt(scene: NarrationScene, frame: number): number {
  if (frame < scene.audioStart || frame >= scene.audioEnd) return 0;
  const index=Math.floor(frame-scene.audioStart);
  const energy=scene.envelope[index]??0;
  return energy<.065?0:Math.min(1,.12+energy*.82);
}

export function narrationReactionMouthAt(reaction:NarrationReaction|undefined,frame:number){
 if(!reaction||frame<reaction.start||frame>=reaction.end)return 0;
 const index=Math.floor(frame-reaction.start);
 const energy=reaction.envelope[index]??0;
 return energy<.065?0:Math.min(1,.12+energy*.82);
}
