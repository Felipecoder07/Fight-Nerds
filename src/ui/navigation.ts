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
  const activate=()=>{const e=document.activeElement as HTMLElement;if(!root.contains(e)){const primary=root.querySelector<HTMLElement>('.primary');if(primary){primary.focus();primary.click();return;}move(1);return;}if(e instanceof HTMLSelectElement)adjust(1);else if(e instanceof HTMLInputElement&&e.type==='range')adjust(1);else e.click();};
  window.addEventListener('keydown',e=>{if(!isMenu())return;const commands:Record<string,()=>void>={ArrowDown:()=>move(1),ArrowUp:()=>move(-1),ArrowLeft:()=>adjust(-1),ArrowRight:()=>adjust(1),Enter:activate,Space:activate,Escape:back};if(commands[e.code]&&(root.contains(document.activeElement)||e.code.startsWith('Arrow')||e.code==='Escape')){e.preventDefault();e.stopImmediatePropagation();commands[e.code]();}},true);
  const padCommand=(p:Gamepad)=>{
    let up=!!p.buttons[12]?.pressed||(p.axes[1]??0)<-.5,down=!!p.buttons[13]?.pressed||(p.axes[1]??0)>.5,left=!!p.buttons[14]?.pressed||(p.axes[0]??0)<-.5,right=!!p.buttons[15]?.pressed||(p.axes[0]??0)>.5;
    if(p.mapping!=='standard'){
      if(p.axes.length>=8){left ||= (p.axes[6]??0)<-.5;right ||= (p.axes[6]??0)>.5;up ||= (p.axes[7]??0)<-.5;down ||= (p.axes[7]??0)>.5;}
      const hat=p.axes[9];
      if(typeof hat==='number'&&Math.abs(hat)>.05&&Math.abs(hat)<=1.05){const d=Math.round((hat+1)*3.5);up ||= d===0||d===1||d===7;right ||= d===1||d===2||d===3;down ||= d===3||d===4||d===5;left ||= d===5||d===6||d===7;}
    }
    return p.buttons[0]?.pressed?1:p.buttons[1]?.pressed?2:down?3:up?4:right?5:left?6:0;
  };
  return ()=>{if(!isMenu()){last=0;return;}const p=Array.from(navigator.getGamepads?.()??[]).find((g):g is Gamepad=>!!g&&g.connected!==false&&padCommand(g)>0);if(!p){last=0;return;}
    const c=padCommand(p);
    const now=performance.now();if(c&&(c!==last||c>=3&&now>=nextRepeat)){nextRepeat=now+(c!==last?350:140);if(c===1)activate();else if(c===2)back();else if(c<=4)move(c===3?1:-1);else adjust(c===5?1:-1);}last=c;
  };
}
