import { test,expect } from '@playwright/test';
test('standing and walking artwork keeps a consistent visible height',async({page})=>{
  await page.goto('/');await expect(page.locator('#play')).toBeVisible();
  const heights=await page.evaluate(async()=>{
    const {fighterAssets,assetScale}=await import('/src/data/assets.ts' as string),result:number[]=[];
    const {scene}=(window as any).__fightNerds.inspect();
    for(const id of ['kaio','luma','joao'])for(const action of ['idle','walk','walk_backward'])for(const name of fighterAssets[id].animations[action].frames){
      const frame=scene.textures.getFrame(id,name),canvas=document.createElement('canvas');canvas.width=frame.cutWidth;canvas.height=frame.cutHeight;
      const ctx=canvas.getContext('2d')!;ctx.drawImage(frame.source.image,frame.cutX,frame.cutY,frame.cutWidth,frame.cutHeight,0,0,canvas.width,canvas.height);
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let top=canvas.height,bottom=-1;
      for(let y=0;y<canvas.height;y++){let count=0;for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>150)count++;if(count>2){top=Math.min(top,y);bottom=y;}}
      result.push(Math.abs((bottom-top+1)*assetScale(id,name)-(id==='joao'?132:128)));
    }return result;
  });
  expect(Math.max(...heights)).toBeLessThan(.01);
});
test('three menu portraits fit inside the cabinet and Joao has his own selection photo',async({page})=>{
  await page.goto('/');await expect(page.locator('#play')).toBeVisible();
  const cabinet=(await page.locator('#cabinet').boundingBox())!;
  for(const id of ['kaio','luma','joao']){
    const portrait=page.locator(`.menu-fighters .${id}`),box=(await portrait.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(cabinet.x);expect(box.x+box.width).toBeLessThanOrEqual(cabinet.x+cabinet.width);
    const loaded=await portrait.evaluate(async el=>{const url=getComputedStyle(el).backgroundImage.slice(5,-2);const image=new Image();image.src=url;await image.decode();return image.naturalWidth>0;});expect(loaded).toBe(true);
  }
  await page.locator('[data-quick="training"]').click();
  await expect(page.locator('[data-player="0"][data-fighter="joao"] .real-portrait')).toHaveCSS('background-image',/joao-bust\.png/);
  await page.locator('#start').click();
  const canvas=page.locator('#game canvas');
  expect(Number(await canvas.getAttribute('width'))).toBeGreaterThanOrEqual(960);
  expect(Number(await canvas.getAttribute('width'))).toBeLessThanOrEqual(1920);
  await expect(canvas).toHaveCSS('image-rendering','auto');
});
test('independent keyboards, pause freezes effects and HUD',async({page})=>{
  await page.goto('/');await page.locator('[data-quick="local"]').click();await expect(page.locator('#start')).toBeInViewport();await page.locator('#start').click();
  await page.waitForFunction(()=>(window as any).__fightNerds.inspect().sim.phase==='fight');
  const before=await page.evaluate(()=>(window as any).__fightNerds.inspect().sim.fighters.map((f:any)=>f.x));
  await page.keyboard.down('a');await page.waitForTimeout(200);await page.keyboard.up('a');
  const after=await page.evaluate(()=>(window as any).__fightNerds.inspect().sim.fighters.map((f:any)=>f.x));expect(after[0]).toBeLessThan(before[0]);expect(after[1]).toBe(before[1]);
  await page.keyboard.press('Escape');await page.evaluate(()=>{const {scene}=(window as any).__fightNerds.inspect();scene.effects=[{type:'hit',x:600,y:300,life:15}];scene.shakeLife=5;});
  const snapshot=()=>page.evaluate(()=>{const {scene,sim}=(window as any).__fightNerds.inspect();return {clock:scene.clock,life:scene.effects[0].life,frame:sim.frame,hudX:scene.texts.left.x,scroll:scene.cameras.main.scrollX};});
  const paused=await snapshot();await page.waitForTimeout(180);expect(await snapshot()).toEqual(paused);
});
test('remapping rejects conflicts, Escape cancels and sliders/selects navigate',async({page})=>{
  await page.goto('/');await page.locator('#instructions').click();const key=page.locator('[data-key-player="0"][data-action="lp"]');await key.click();await page.keyboard.press('j');await expect(key).toHaveText('F');await expect(page.locator('#conflicts')).toContainText('jogador 2');await key.click();await page.keyboard.press('Escape');await expect(key).toHaveText('F');await expect(page.locator('#settings-back')).toBeVisible();
  await page.locator('#volume').focus();const previous=Number(await page.locator('#volume').inputValue());await page.keyboard.press('ArrowRight');expect(Number(await page.locator('#volume').inputValue())).toBeCloseTo(previous+.05);
  await page.locator('#animation-gallery').click();await page.locator('#preview-action').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#preview-action')).toHaveValue('stand_mp');await page.locator('#preview-play').click();const frame=await page.locator('#preview-frame').textContent();await page.waitForTimeout(160);await expect(page.locator('#preview-frame')).toHaveText(frame!);await page.locator('#preview-step').click();await expect(page.locator('#preview-frame')).not.toHaveText(frame!);
});
test('two simulated pads keep ownership and reconnection requires confirmation',async({page})=>{
  await page.addInitScript(()=>{const pad=(index:number)=>({index,id:'Test pad '+index,connected:true,mapping:'standard',timestamp:0,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0}))});(window as any).testPads=[pad(0),null,pad(2)];Object.defineProperty(navigator,'getGamepads',{value:()=>(window as any).testPads});});
  await page.goto('/');await page.locator('[data-quick="local"]').click();await page.locator('[data-device="0"]').selectOption('pad:2');await page.locator('[data-device="1"]').selectOption('pad:0');await page.locator('#start').click();await page.waitForFunction(()=>(window as any).__fightNerds.inspect().sim.phase==='fight');
  await page.evaluate(()=>{(window as any).testPads[2].axes[0]=-1;});
  const inputs=await page.evaluate(()=>(window as any).__fightNerds.inspect().input.read());expect(inputs[0].left).toBe(true);expect(inputs[1].left).toBe(false);
  await page.evaluate(()=>{const e=new Event('gamepaddisconnected');Object.defineProperty(e,'gamepad',{value:(window as any).testPads[0]});(window as any).testPads[0]=null;window.dispatchEvent(e);});await expect(page.locator('#resume')).toBeVisible();
  await page.evaluate(()=>{const w=window as any;w.testPads[2].axes[0]=0;w.testPads[0]={...w.testPads[2],index:0};window.dispatchEvent(new Event('gamepadconnected'));});
  expect(await page.evaluate(()=>(window as any).__fightNerds.inspect().input.ready())).toBe(false);
  await page.locator('#resume').click();await expect(page.locator('#confirm-devices')).toBeVisible();await page.locator('#confirm-devices').click();expect(await page.evaluate(()=>(window as any).__fightNerds.inspect().input.ready())).toBe(true);await page.locator('#settings-back').click();await page.locator('#resume').click();await expect(page.locator('#resume')).toHaveCount(0);
});
test('all atlas frames load and menus remain usable on smaller screens',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:800,height:640});await page.goto('/');await page.locator('[data-quick="training"]').click();await expect(page.locator('#start')).toBeInViewport();await page.locator('#start').click();
  const missing=await page.evaluate(async()=>{const {scene}=(window as any).__fightNerds.inspect(),{fighterAssets}=await import('/src/data/assets.ts' as string);const missing:string[]=[];for(const [id,a] of Object.entries(fighterAssets) as any)for(const anim of Object.values(a.animations) as any)for(const f of anim.frames)if(!scene.textures.get(id).has(f))missing.push(id+':'+f);return missing;});expect(missing).toEqual([]);expect(errors).toEqual([]);
});
test('either gamepad can operate menu sliders and gallery selects',async({page})=>{
  await page.addInitScript(()=>{const pad=(index:number)=>({index,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});(window as any).testPads=[pad(0),pad(1)];Object.defineProperty(navigator,'getGamepads',{value:()=>(window as any).testPads});});
  await page.goto('/');await page.locator('#instructions').click();await page.locator('#volume').focus();const before=Number(await page.locator('#volume').inputValue());await page.evaluate(()=>{(window as any).testPads[1].axes[0]=1;});await expect.poll(async()=>Number(await page.locator('#volume').inputValue())).toBeGreaterThan(before);await page.evaluate(()=>{(window as any).testPads[1].axes[0]=0;});
  await page.locator('#animation-gallery').click();await page.locator('#preview-action').focus();await page.evaluate(()=>{(window as any).testPads[1].axes[0]=1;});await expect.poll(()=>page.locator('#preview-action').inputValue()).not.toBe('stand_lp');await page.evaluate(()=>{(window as any).testPads[1].axes[0]=0;(window as any).testPads[1].buttons[1].pressed=true;});await expect(page.locator('#settings-back')).toBeVisible();
});
test('full arena retreat stays visible and attacks keep their physical position',async({page})=>{
  await page.goto('/');await page.locator('[data-quick="local"]').click();await page.locator('#start').click();await page.keyboard.press('Escape');
  await page.evaluate(()=>{const {sim,scene}=(window as any).__fightNerds.inspect();sim.phase='fight';sim.fighters[0].x=34;sim.fighters[1].x=1406;scene.visualCamera.reset();});
  await expect.poll(()=>page.evaluate(()=>(window as any).__fightNerds.inspect().scene.visualCamera.zoom)).toBeLessThan(.7);
  const snapshot=await page.evaluate(()=>{const {scene,sim}=(window as any).__fightNerds.inspect();return {positions:sim.fighters.map((f:any)=>f.x),sprites:scene.sprites.map((s:any)=>s.x),hudScale:scene.hud.scaleX};});
  expect(snapshot.positions).toEqual([34,1406]);expect(snapshot.sprites.every((x:number)=>x>0&&x<960)).toBe(true);expect(snapshot.hudScale).toBe(1);
  await page.evaluate(()=>{const {sim}=(window as any).__fightNerds.inspect();sim.fighters.forEach((f:any)=>sim.startMove(f,'stand_lp'));});
  await expect.poll(()=>page.evaluate(()=>(window as any).__fightNerds.inspect().scene.sprites.map((s:any)=>s.frame.name))).toEqual(['attacks/0','attacks/0']);
  expect(await page.evaluate(()=>(window as any).__fightNerds.inspect().scene.sprites.map((s:any)=>s.x))).toEqual(snapshot.sprites);
  // Phaser mirrors custom atlas pivots itself. Inverting the origin again moves P2.
  expect(await page.evaluate(()=>(window as any).__fightNerds.inspect().scene.sprites.every((s:any)=>s.frame.customPivot&&s.originX===s.frame.pivotX))).toBe(true);
});
