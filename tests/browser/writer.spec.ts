import {test,expect} from '@playwright/test';
import {generate} from '../../src/catalog';
test('IA cria ideias distintas com tema, duração e histórico sem gerar voz ao revisar',async({page})=>{
 const inputs:any[]=[];let renders=0;
 await page.route('**/api/voice-settings/writer',r=>r.fulfill({json:{enabled:true,hasKey:true}}));
 await page.route('**/api/voice-settings/story',r=>{const input=r.request().postDataJSON();inputs.push(input);const p=generate('Humor',15,true);return r.fulfill({json:{project:{...p,theme:input.theme,status:'editado',title:`Nova ideia ${inputs.length}`}}});});
 await page.route('**/api/render',r=>{renders++;return r.fulfill({status:202,json:{id:'11111111-1111-1111-1111-111111111111'}});});
 await page.route('**/api/jobs/*',r=>r.fulfill({json:{status:'rendering',progress:.3}}));
 await page.goto('/');await page.getByLabel('Tema do vídeo').selectOption('Trabalho');
 await page.getByRole('button',{name:'Criar roteiro neste tema',exact:true}).click();await expect(page.locator('.video-info h2')).toHaveText('Nova ideia 1');
 await page.getByRole('button',{name:'Criar roteiro neste tema',exact:true}).click();await expect(page.locator('.video-info h2')).toHaveText('Nova ideia 2');
 expect(inputs[1].history.some((h:any)=>h.title==='Nova ideia 1')).toBe(true);expect(renders).toBe(0);
 await page.getByRole('button',{name:'Gerar outro vídeo',exact:false}).click();
 await expect.poll(()=>renders).toBe(1);expect(inputs).toHaveLength(3);
});
