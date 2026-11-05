import {test,expect} from '@playwright/test';
test('gerar do editor protege falas e impede requisições duplicadas',async({page})=>{
 let requests:any[]=[];
 await page.route('**/api/health',r=>r.fulfill({json:{browserReady:true}}));
 await page.route('**/api/render',async r=>{requests.push(r.request().postDataJSON());await new Promise(resolve=>setTimeout(resolve,400));await r.fulfill({status:202,json:{id:'11111111-1111-1111-1111-111111111111'}});});
 await page.route('**/api/jobs/*',r=>r.fulfill({json:{status:'rendering',progress:.4,message:'Teste em andamento'}}));
 await page.goto('/');
 await page.locator('.video-actions').getByRole('button',{name:'Editar roteiro'}).click();
 await page.getByLabel('Título',{exact:true}).fill('Meu texto protegido');
 await page.getByRole('textbox',{name:'Fala',exact:true}).first().fill('Esta fala precisa continuar aqui.');
 await page.getByRole('button',{name:'GERAR VÍDEO DE HOJE',exact:false}).evaluate((b:HTMLButtonElement)=>{b.click();b.click();});
 await expect.poll(()=>requests.length).toBe(1);
 expect(requests[0].status).toBe('editado');expect(requests[0].scenes[0].line).toBe('Esta fala precisa continuar aqui.');
 await expect(page.locator('.video-actions').getByRole('button',{name:'Editar roteiro'})).toBeDisabled();
 await page.locator('.day-open').first().click();
 await expect(page.locator('.video-info h2')).toHaveText('Meu texto protegido');
 await expect(page.getByLabel('Editor de roteiro')).toHaveCount(0);
});
test('duplicar preserva roteiro personalizado e nova ideia não descarta edição',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Meus vídeos',exact:false}).click();
 await page.getByRole('button',{name:'Duplicar',exact:true}).first().click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('palito-show-v1')!).projects.at(-1).status)).toBe('editado');
 await page.getByRole('button',{name:'Abrir / editar',exact:true}).first().click();
 await expect(page.getByRole('button',{name:'Gerar outro vídeo',exact:false})).toBeDisabled();
});
