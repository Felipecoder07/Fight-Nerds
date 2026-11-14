import { test, expect } from '@playwright/test';
test('arte dedicada, galeria e tela cheia', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('#play')).toBeVisible();
  await expect(page.locator('.menu-fighters .real-portrait')).toHaveCount(3);
  for (const file of ['el-felpo', 'gusta', 'joao']) { const r = await page.request.get(`/assets/portraits/${file}.png`); expect(r.ok()).toBe(true); expect(r.headers()['content-type']).toContain('image/png'); }
  await page.locator('#fullscreen').click(); await expect.poll(() => page.evaluate(() => !!document.fullscreenElement || document.querySelector('#cabinet')!.classList.contains('expanded'))).toBe(true);
  await page.locator('#fullscreen').click(); await expect.poll(() => page.evaluate(() => !!document.fullscreenElement || document.querySelector('#cabinet')!.classList.contains('expanded'))).toBe(false);
  await page.locator('#instructions').click(); await page.locator('#animation-gallery').click();
  await page.locator('#preview-action').selectOption('crouch_hk'); await expect(page.locator('#preview-canvas canvas')).toBeVisible();
  await page.locator('#preview-close').click(); await page.keyboard.press('Escape'); await expect(page.locator('#play')).toBeVisible();
  await page.screenshot({ path: 'test-results/menu-atual.png' });
});
test('treinamento, opções, caixas e avanço de frame', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('button', { name: 'ENTRAR NA LUTA' })).toBeVisible();
  await page.keyboard.press('Enter'); await page.locator('[data-mode="training"]').click(); await page.getByRole('button', { name: /TREINAR/ }).click();
  await page.getByRole('button', { name: 'AJUSTES', exact: true }).click(); await page.getByLabel('Exibir caixas de colisão').check(); await page.locator('#dummy').selectOption('block'); await page.locator('#speed').selectOption('0.5');
  await page.getByRole('button', { name: 'VOLTAR AO TREINO' }).click(); await expect(page.getByRole('button', { name: 'CAIXAS ON' })).toBeVisible();
  await page.keyboard.press('Escape'); await page.getByRole('button', { name: 'AVANÇAR 1 FRAME' }).click(); await expect(page.getByRole('heading', { name: /PAUSADO/ })).toBeVisible();
});
test('resultado, revanche e nova seleção', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('button', { name: 'ENTRAR NA LUTA' })).toBeVisible();
  await page.keyboard.press('Enter'); await expect(page.getByRole('heading', { name: /ESCOLHA SUA LUTA/ })).toBeVisible();
  await page.getByRole('button', { name: /COMEÇAR ROUND/ }).click();
  await page.waitForFunction(async () => { const p = '/src/main.ts'; const { inspect } = await import(p); return inspect().sim.phase === 'fight'; }, { timeout: 8000 });
  // Trigger deterministic round endings through the dev module; result navigation uses actual UI.
  await page.evaluate(async () => { const path = '/src/main.ts'; const { inspect } = await import(path); const { sim } = inspect(); sim.fighters[0].wins = 1; sim.fighters[1].hp = 0; });
  await expect(page.getByRole('button', { name: 'REVANCHE' })).toBeVisible({ timeout: 8000 }); await page.getByRole('button', { name: 'REVANCHE' }).click();
  await page.keyboard.press('Escape'); await page.getByRole('button', { name: 'NOVA SELEÇÃO' }).click(); await expect(page.getByRole('heading', { name: /ESCOLHA SUA LUTA/ })).toBeVisible();
});
