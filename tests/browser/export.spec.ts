import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {generate,initialState,ensurePlan} from '../../src/catalog';
import {dateKey} from '../../src/model';
for(const category of ['Humor','Motivação'] as const){
 test(`geração automática com duas vozes: ${category}`,async({page,request})=>{
  test.setTimeout(600000);
  const duration=category==='Humor'?15:30;
  const state=initialState();const project=generate(category,duration,true);state.projects=[project];state.plan[dateKey(new Date())]=project.id;
  await page.addInitScript(s=>{if(!localStorage.getItem('palito-show-v1'))localStorage.setItem('palito-show-v1',JSON.stringify(s));},ensurePlan(state));
  // Set only initial state once: reload must preserve actual production results.
  await page.goto('/');
  await page.getByRole('button',{name:'GERAR VÍDEO DE HOJE',exact:false}).click();
  const download=page.getByRole('link',{name:'Baixar vídeo MP4',exact:false});await Promise.race([expect(download).toBeVisible({timeout:540000}),page.getByRole('alert').waitFor({state:'visible',timeout:540000}).then(async()=>{throw Error((await page.getByRole('alert').textContent())||'Falha na geração');})]);
  const error=page.getByRole('alert');expect(await error.count()).toBe(0);
  const downloadPromise=page.waitForEvent('download');await download.click();const file=await downloadPromise;const filename=`examples/${category==='Humor'?'humor-15s':'motivacao-30s'}-com-vozes.mp4`;await file.saveAs(filename);
  const probe=JSON.parse(execFileSync(process.env.FFPROBE_PATH||'ffprobe',['-v','error','-show_streams','-of','json',filename],{encoding:'utf8'}));
  const video=probe.streams.find((s:any)=>s.codec_type==='video');expect(video.codec_name).toBe('h264');expect(video.width).toBe(1080);expect(video.height).toBe(1920);expect(Number(video.duration)).toBe(duration);expect(probe.streams.some((s:any)=>s.codec_name==='aac')).toBeTruthy();
  await page.getByRole('button',{name:'Assistir',exact:false}).click();await expect.poll(()=>page.locator('.finished-video').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
  await page.getByRole('button',{name:'Aprovar vídeo',exact:true}).click();await expect(page.getByRole('button',{name:'✓ Aprovado'})).toBeDisabled();
  const exported=await page.evaluate(()=>JSON.parse(localStorage.getItem('palito-show-v1')!));const result=exported.projects.find((p:any)=>p.id===project.id);expect(result.status).toBe('exportado');expect(result.approved).toBe(true);expect(result.renderId).toBeTruthy();
  const report=await request.get(`/api/productions/${result.renderId}`);expect(report.status()).toBe(200);const manifest=await report.json();expect(new Set(manifest.voices.map((v:any)=>v.voice)).size).toBe(2);expect(manifest.quality.decodedCompletely).toBe(true);expect(manifest.quality.speech.length).toBe(manifest.project.scenes.length);
  const {writeFile}=await import('node:fs/promises');await writeFile(filename.replace('.mp4','.json'),JSON.stringify(manifest,null,2));
  // A new page in the same context reuses real localStorage without seeding.
  const reopened=await page.context().newPage();await reopened.goto('/');await expect(reopened.locator('.finished-video')).toHaveAttribute('src',`/api/files/${result.renderId}.mp4`);await reopened.close();
 });
}
