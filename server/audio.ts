export function waveBuffer(samples: Int16Array, sampleRate: number): Buffer {
  const dataSize = samples.length * 2;
  const out = Buffer.alloc(44 + dataSize);
  out.write('RIFF', 0); out.writeUInt32LE(36 + dataSize, 4); out.write('WAVE', 8);
  out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22); out.writeUInt32LE(sampleRate, 24);
  out.writeUInt32LE(sampleRate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) out.writeInt16LE(samples[i], 44 + i * 2);
  return out;
}

/** RMS amplitude for each 30fps frame: silence closes the mouth, speech opens it. */
export function amplitudeEnvelope(samples: Int16Array, sampleRate: number): number[] {
  const values: number[] = [];
  for (let frame = 0; frame < Math.ceil(samples.length / sampleRate * 30); frame++) {
    const start = Math.floor(frame * sampleRate / 30);
    const end = Math.min(samples.length, Math.floor((frame + 1) * sampleRate / 30));
    let power = 0;
    for (let i = start; i < end; i++) power += samples[i] ** 2;
    values.push(end > start ? Math.sqrt(power / (end - start)) : 0);
  }
  const peak = Math.max(1, ...values);
  return values.map(rms => rms < 100 ? 0 : Math.min(1, Math.round(rms / peak * 1000) / 1000));
}

