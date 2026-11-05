import {test,expect} from '@playwright/test';
test('configuração ElevenLabs não grava chave no navegador e não gera áudio ao salvar',async({page})=>{
 let config={provider:'local',hasKey:false,palito:'',tica:''};let calls=0;let received:any;
 await page.route('**/api/voice-settings',async r=>{if(r.request().method()==='POST'){received=r.request().postDataJSON();config={provider:received.provider,hasKey:true,palito:received.palito||'',tica:received.tica||''};}await r.fulfill({json:config});});
 await page.route('**/api/voice-settings/test',r=>{calls++;return r.fulfill({json:{audio:''}});});
 await page.goto('/');await page.getByRole('button',{name:/^⚙ Configurações$/}).click();
 await page.getByLabel('Provedor de voz').selectOption('elevenlabs');await page.getByLabel('Chave ElevenLabs').fill('fake-test-key');
 await page.getByRole('button',{name:'Salvar vozes',exact:true}).click();
 await expect(page.getByLabel('Chave ElevenLabs')).toHaveValue('');expect(received.apiKey).toBe('fake-test-key');expect(calls).toBe(0);
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('fake-test-key');
});

test('teste de voz apresenta restrição do plano como erro visível',async({page})=>{
 await page.route('**/api/voice-settings',r=>r.fulfill({json:{provider:'elevenlabs',hasKey:true,palito:'roger',tica:'roberta'}}));
 await page.route('**/api/voice-settings/test',r=>r.fulfill({status:400,json:{error:'Tica: Esta voz ou recurso exige um plano pago na API do ElevenLabs. (HTTP 402)'}}));
 await page.goto('/');await page.getByRole('button',{name:/^⚙ Configurações$/}).click();
 await page.getByRole('button',{name:'Testar Tica',exact:false}).click();
 await expect(page.getByRole('alert')).toContainText('HTTP 402');await expect(page.getByRole('alert')).toContainText('plano pago');
 await expect(page.getByRole('button',{name:'Testar Tica',exact:false})).toBeEnabled();
});
