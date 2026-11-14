/** Menu commands never enter the combat input buffer. */
export function installNavigation(root:HTMLElement,isMenu:()=>boolean,back:()=>void){
  let last=0,nextRepeat=0;
  const controls=()=>Array.from(root.querySelectorAll<HTMLElement>('button,select,input')).filter(e=>e.getClientRects().length&&!e.hasAttribute('disabled'));
  const move=(d:number)=>{const all=controls();if(!all.length)return;const i=all.indexOf(document.activeElement as HTMLElement);all[i<0?0:(i+d+all.length)%all.length].focus();};
  const adjust=(d:number)=>{const e=document.activeElement;
    if(e instanceof HTMLSelectElement&&root.contains(e)){e.selectedIndex=Math.max(0,Math.min(e.options.length-1,e.selectedIndex+d));e.dispatchEvent(new Event('change',{bubbles:true}));}
    else if(e instanceof HTMLInputElement&&e.type==='range'&&root.contains(e)){e.value=String(Math.max(Number(e.min),Math.min(Number(e.max),Number(e.value)+d*Number(e.step||1))));e.dispatchEvent(new Event('input',{bubbles:true}));}
    else move(d);
  };
  const activate=()=>{const e=document.activeElement as HTMLElement;if(!root.contains(e)){move(1);return;}if(e instanceof HTMLSelectElement)adjust(1);else if(e instanceof HTMLInputElement&&e.type==='range')adjust(1);else e.click();};
  window.addEventListener('keydown',e=>{if(!isMenu())return;const commands:Record<string,()=>void>={ArrowDown:()=>move(1),ArrowUp:()=>move(-1),ArrowLeft:()=>adjust(-1),ArrowRight:()=>adjust(1),Enter:activate,Space:activate,Escape:back};if(commands[e.code]&&(root.contains(document.activeElement)||e.code.startsWith('Arrow')||e.code==='Escape')){e.preventDefault();e.stopImmediatePropagation();commands[e.code]();}},true);
  return ()=>{if(!isMenu()){last=0;return;}const p=Array.from(navigator.getGamepads?.()??[]).find(p=>p&&(p.buttons.some(b=>b.pressed)||p.axes.slice(0,2).some(a=>Math.abs(a)>.5)));if(!p){last=0;return;}
    const c=p.buttons[0]?.pressed?1:p.buttons[1]?.pressed?2:p.buttons[13]?.pressed||p.axes[1]>.5?3:p.buttons[12]?.pressed||p.axes[1]<-.5?4:p.buttons[15]?.pressed||p.axes[0]>.5?5:p.buttons[14]?.pressed||p.axes[0]<-.5?6:0;
    const now=performance.now();if(c&&(c!==last||c>=3&&now>=nextRepeat)){nextRepeat=now+(c!==last?350:140);if(c===1)activate();else if(c===2)back();else if(c<=4)move(c===3?1:-1);else adjust(c===5?1:-1);}last=c;
  };
}
