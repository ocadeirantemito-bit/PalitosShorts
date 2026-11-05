import {test,expect} from '@playwright/test';
test('estúdio: data, animação, edição, persistência, backup e iPhone',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(crypto,'randomUUID',{value:undefined,configurable:true}));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByRole('heading',{name:'Vamos dar vida à sua ideia?'})).toBeVisible();
 const date=await page.evaluate(()=>new Date().toLocaleDateString('pt-BR'));await expect(page.getByText(`Hoje é ${date}`)).toBeVisible();
 await expect(page.locator('.day-card')).toHaveCount(7);await expect(page.locator('[data-testid=video-preview] svg [data-character="PALITO"]').first()).toBeVisible();
 await page.getByRole('button',{name:'Visualizar animação',exact:false}).click();
 const animation=page.locator('[data-testid=video-preview] svg').first();const before=await animation.getAttribute('data-frame');await expect.poll(()=>animation.getAttribute('data-frame')).not.toBe(before);

 await page.locator('.video-actions').getByRole('button',{name:'Editar roteiro'}).click();
 await page.getByLabel('Título',{exact:true}).fill('Minha história de teste');await page.getByRole('textbox',{name:'Fala',exact:true}).first().fill('Hoje eu criei meu primeiro vídeo!');
 await expect(page.getByTestId('video-preview')).toContainText('Minha história de teste');
 await page.getByRole('button',{name:'Salvar alterações'}).click();
 const plan=await page.evaluate(()=>JSON.parse(localStorage.getItem('palito-show-v1')!).plan);
 await page.reload();await expect(page.getByRole('heading',{name:'Minha história de teste',exact:true,level:2})).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('palito-show-v1')!).plan)).toEqual(plan);
 await page.getByRole('button',{name:/^⚙ Configurações$/}).click();const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar backup JSON',exact:false}).click();const backup=await downloadPromise;const path=await backup.path();expect(path).toBeTruthy();
 await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});await expect(page.getByRole('alert')).toContainText('Backup inválido');
 await page.locator('input[type=file]').setInputFiles(path!);await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Confirmar restauração'}).click();await expect(page.getByRole('status')).toContainText('Backup restaurado');
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Visão geral',exact:false}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'Fechar aviso'}).click();await page.reload();await page.screenshot({path:'examples/iphone.png',fullPage:true});await page.setViewportSize({width:1440,height:1100});await page.reload();await page.screenshot({path:'examples/desktop.png',fullPage:true});expect(errors).toEqual([]);
});
test('biblioteca duplica, tema muda e erros de API são claros',async({page,request})=>{
 await page.goto('/');await page.getByRole('button',{name:'Meus vídeos',exact:false}).click();const count=await page.locator('.project-card').count();await page.getByRole('button',{name:'Duplicar',exact:true}).first().click();await expect(page.locator('.project-card')).toHaveCount(count+1);
 await page.getByRole('button',{name:/^⚙ Configurações$/}).click();await page.getByRole('combobox',{name:'Tema',exact:true}).selectOption('light');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 const invalid=await request.post('/api/render',{data:{}});expect(invalid.status()).toBe(400);const missing=await request.get('/api/jobs/missing');expect(missing.status()).toBe(404);
});
