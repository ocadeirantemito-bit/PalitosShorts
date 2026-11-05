import {test,expect} from '@playwright/test';
for(const [setting,outfit] of [['escritorio','trabalho'],['cozinha','casa'],['varanda','casual']])test(`cenário e roupas: ${setting}`,async({page})=>{
 await page.goto('/');await page.locator('.video-actions').getByRole('button',{name:'Editar roteiro'}).click();
 await page.getByRole('combobox',{name:/^Cenário/}).selectOption(setting);await page.getByRole('combobox',{name:/^Roupa/}).selectOption(outfit);
 await expect(page.locator(`[data-testid=video-preview] [data-outfit="${outfit}"]`)).toHaveCount(2);
 await page.getByTestId('video-preview').screenshot({path:`examples/novo-${setting}.png`});
});
