import {test,expect} from '@playwright/test';
import {generate,initialState,ensurePlan} from '../../src/catalog';
import {dateKey} from '../../src/model';
test('conversa continua animada depois da entrada e mantém pés fixos',async({page})=>{
 const state=initialState();const p=generate('Humor',30,false);p.scenes=p.scenes.map(s=>({...s,speaker:'PALITO',action:'falar'}));state.projects=[p];state.plan[dateKey(new Date())]=p.id;
 await page.addInitScript(s=>localStorage.setItem('palito-show-v1',JSON.stringify(s)),ensurePlan(state));
 await page.goto('/');await page.getByRole('button',{name:'Visualizar animação',exact:false}).click();
 const svg=page.locator('[data-testid=video-preview] svg').first();await expect.poll(async()=>Number(await svg.getAttribute('data-frame')),{timeout:12000}).toBeGreaterThan(140);
 const arms=page.locator('[data-testid=video-preview] [data-character="PALITO"] [data-conversation-hands]');
 const before=await arms.innerHTML();await expect.poll(()=>arms.innerHTML()).not.toBe(before);
 await expect(page.locator('[data-testid=video-preview] [data-character="PALITO"] > g').first()).toHaveAttribute('transform','translate(330,810) scale(1)');
 await page.getByTestId('video-preview').screenshot({path:'examples/gesto-conversa.png'});
});
