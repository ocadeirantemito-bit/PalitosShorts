import {test,expect} from '@playwright/test';
test('escolher tema prepara falas e persiste sem iniciar renderização',async({page})=>{
 let renders=0;await page.route('**/api/render',route=>{renders++;return route.abort();});
 await page.goto('/');
 await page.getByLabel('Tema do vídeo').selectOption('Trabalho');
 await page.getByRole('button',{name:'Criar roteiro neste tema',exact:true}).click();
 await expect(page.getByLabel('Falas do roteiro')).toBeVisible();
 const first=await page.locator('.video-info h2').innerText();
 await page.getByRole('button',{name:'Criar roteiro neste tema',exact:true}).click();
 await expect(page.locator('.video-info h2')).not.toHaveText(first);
 await page.getByLabel('Tema do vídeo').selectOption('Sextou e bebidas');
 await page.getByRole('button',{name:'Criar roteiro neste tema',exact:true}).click();
 await expect(page.locator('.category-tag')).toContainText('Sextou e bebidas');
 expect(renders).toBe(0);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('palito-show-v1')!).projects.at(-1));
 expect(saved.theme).toBe('Sextou e bebidas');expect(saved.scenes).toHaveLength(3);
});
