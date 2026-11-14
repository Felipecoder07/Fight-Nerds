import { ACTIONS, type Action } from '../combat/types';
export const reservedKeys=['Escape','Enter','Period','Tab','Space','Digit1','Digit2','Digit3','Digit4'];
export function keyConflict(keys:Record<Action,string>[],code:string,player=-1,action:Action|null=null){
  if(reservedKeys.includes(code))return 'Tecla reservada pela interface.';
  for(let p=0;p<2;p++)for(const a of ACTIONS)if(!(p===player&&a===action)&&keys[p][a]===code)return `Tecla já atribuída ao jogador ${p+1}.`;
  return null;
}
