import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSpeech, validateTiming} from '../server/quality';
import type {Narration} from '../src/narration';
const timeline = (): Narration => ({durationInFrames: 450, scenes: [{start: 0, end: 450, audioStart: 30, audioEnd: 90, envelope: Array(60).fill(.8), src: 'speech.wav', speaker: 'PALITO'}]});

test('qualidade rejeita voz fora da cena, lacunas e duração divergente', () => {
  assert.doesNotThrow(() => validateTiming(timeline(), 15));
  assert.throws(() => validateTiming(timeline(), 30), /duração/);
  const out = timeline(); out.scenes[0].audioEnd = 451;
  assert.throws(() => validateTiming(out, 15), /cena 1/);
  const gap = timeline(); gap.scenes[0].start = 1;
  assert.throws(() => validateTiming(gap, 15), /cena 1/);
  const ending = timeline(); ending.scenes[0].end = 449;
  assert.throws(() => validateTiming(ending, 15), /lacuna/);
});

test('áudio decodificado precisa corresponder às janelas de voz, não apenas a efeitos', () => {
  const pcm = Buffer.alloc(15 * 8000 * 2);
  // A pop before narration cannot satisfy a voice window.
  for (let i = 0; i < 2000; i++) pcm.writeInt16LE(Math.round(5000 * Math.sin(i / 10)), i * 2);
  assert.throws(() => inspectSpeech(pcm, timeline()), /ausente/);
  for (let i = 8000; i < 24000; i++) pcm.writeInt16LE(Math.round(5000 * Math.sin(i / 10)), i * 2);
  const report = inspectSpeech(pcm, timeline());
  assert.equal(report[0].audibleVoicedFrames, 60);
  assert.ok(report[0].rms > .01);
  // Clip the middle of the speech, while retaining audible start and ending.
  pcm.fill(0, 10000 * 2, 22000 * 2);
  assert.throws(() => inspectSpeech(pcm, timeline()), /fora de sincronia/);
});
