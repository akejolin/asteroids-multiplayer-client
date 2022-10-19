import type {Ikeys} from './keys'
import type { Iscreen } from './screen-handler'

export interface Iposition {
  x: number,
  y: number,
}

export interface CanvasItem {
  position: Iposition,
  delete: boolean,
  create: Function,
  render: Function,
  type: string,
  destroy: Function,
  radius: number,
  isInRadar?: boolean,
  radarRadius?: number,
  id?:number,
}

export interface StarItem extends CanvasItem {

}

export interface Ishield extends CanvasItem {
  isActive: boolean,
  addInterferer?:Function,
  removeInterferer?:Function,
}
export interface ShipItem extends CanvasItem {
  upgrade: Function,
  newWeapon: Function,
  updateSecondaryWeapon:Function,
}
export interface PresentItem extends CanvasItem {
  getUpgrade: Function,
}

export interface soundArrObject {
  [key: string]: any
}

export interface CanvasItemGroups {
  [key: string]: CanvasItem[]
}


export interface IState {
  screen: Iscreen,
  context: CanvasRenderingContext2D | null,
  keys : Ikeys,
  colorThemeIndex: number,
  upgradeFuel: number,
  readyforNextLife: boolean,
  hasError: boolean,
  nextPresentDelay: number,
  ufoDelay:number,
  inifityScreen:boolean,
  inifityFuel:number,
}


export interface collisionObject {
  primary: string;
  secondary: Array<string>;
  cb: Function;
  inRadarCb?:Function;
}



export interface IupgradeBase {
  type: string,
  image: string,
  color: string,
  catchSound?: string,
}

export interface IshipWeapon extends IupgradeBase{
  duration?: number,
  lifeSpan?: number,
  size: number,
  range: number,
  lastShotLimit: number,
}

export interface IsecondaryWeapon extends IupgradeBase{
  duration?: number,
  lifeSpan?: number,
  size: number,
  range: number,
  lastShotLimit: number,
  speed: number,
}
export interface IshipEquipment extends IupgradeBase{

}
export interface IgameChanger extends IupgradeBase{

}

export interface IspaceInterferer extends IupgradeBase{

}

export interface upgradeArray extends Array<IshipWeapon|IgameChanger|IshipEquipment|IspaceInterferer> {
  
}

export interface Isound {
    file: string,
    status: string
}

export interface Iuifx {
  file: string,
  volume: number,
  throttleMs: number,
  play: Function,
  setVolume: Function,
  validateVolume: Function,
}