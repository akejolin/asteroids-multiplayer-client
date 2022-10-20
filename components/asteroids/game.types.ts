
export interface Iscreen {
  width: number,
  height: number,
  ratio: number,
}

export interface Iposition {
  x: number,
  y: number,
}

export interface iPlayer {
  id: string,
  name: string,
  keys: Ikeys,
  isHost: boolean,
  score: number
  lives: number
}

export interface Ikeys {
  left  : boolean,
  right : boolean,
  up    : boolean,
  down  : boolean,
  space : boolean,
  return: boolean,
  weapon: boolean,
  escape: boolean,
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

export interface iBullet extends CanvasItem {
  type: string,
  rotation: number,
  position: Iposition,
  originPos: Iposition,
  velocity: Iposition,
  radius: number,
  delete: boolean,
  range: number,
  lifeSpan: number,
  onSound: Function,
  color: string,
  isInRadar: boolean,
  id: number,
  originId: string,
}

export interface ShipItem extends CanvasItem {
  player: iPlayer,
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
  gameStatus: string,
  level: number,
  colorThemeIndex: number;
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