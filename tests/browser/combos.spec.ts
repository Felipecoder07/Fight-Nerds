import { test, expect } from '@playwright/test';

test('move guide, training pause and blood preference', async ({page}) => {
  await page.goto('/');
  await page.locator('#move-guide').click();
  await expect(page.getByRole('heading', {name:'GOLPES & COMBOS.'})).toBeVisible();
  await expect(page.locator('.signature-cards article')).toHaveCount(3);
  await page.locator('#guide-back').click();
  await page.locator('#instructions').click();
  await page.locator('#blood').uncheck();
  await page.reload();
  await page.locator('#instructions').click();
  await expect(page.locator('#blood')).not.toBeChecked();
  await page.locator('#settings-back').click();
  await page.locator('[data-quick="training"]').click();
  await page.locator('#start').click();
  await page.locator('#train-guide').click();
  const frame=await page.evaluate(()=>(window as any).__fightNerds.inspect().sim.frame);
  await page.waitForTimeout(150);
  expect(await page.evaluate(()=>(window as any).__fightNerds.inspect().sim.frame)).toBe(frame);
  await page.locator('#guide-back').click();
  await page.locator('#resume').click();
  await expect(page.locator('#train-guide')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>(window as any).__fightNerds.inspect().sim.frame)).toBeGreaterThan(frame);
});

test('close knockout accepts the mapped finisher and reaches results', async ({page}) => {
  await page.goto('/');
  await page.locator('[data-quick="local"]').click();
  await page.locator('#start').click();
  await page.waitForFunction(()=>(window as any).__fightNerds.inspect().sim.phase==='fight');
  const keys=await page.evaluate(()=>{
    const {sim,input}=(window as any).__fightNerds.inspect();
    sim.fighters[0].x=650;sim.fighters[1].x=730;
    sim.fighters[0].wins=1;sim.fighters[1].hp=0;
    return [input.prefs.keys[0].hp,input.prefs.keys[0].hk];
  });
  await page.waitForFunction(()=>(window as any).__fightNerds.inspect().sim.canFinish);
  await page.keyboard.down(keys[0]);await page.keyboard.down(keys[1]);
  await page.waitForFunction(()=>(window as any).__fightNerds.inspect().sim.phase==='finisher');
  await page.keyboard.up(keys[0]);await page.keyboard.up(keys[1]);
  await expect(page.locator('#rematch')).toBeVisible({timeout:20000});
});
