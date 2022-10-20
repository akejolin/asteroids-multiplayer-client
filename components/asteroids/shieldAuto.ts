
import { asteroidVertices, randomNumBetween } from './helpers';
import { addInterval, removeInterval } from './gameIntervalHandler'
import type { IState, Iposition, CanvasItem} from './game.types'

let classRoot = this;
export interface Iprops {
  position:Iposition,
  onSound:Function,
  onStopSound:Function,
  create:Function,
  ship:any,
}
export interface IShield extends CanvasItem {}

export default class AutoShield {
  public type:string = 'autoShield';
  velocity: Iposition;
  position: Iposition;
  onSound: Function;
  onStopSound: Function;
  create:Function;
  radius: number;
  vertices;
  color:string;
  alpha:number;
  ship;
  fuel:number;
  public isActive:boolean;
  delete:boolean;
  public radarRadius:number = 20
  public radarThreshold: number = 0
  flashInterval:number = 5
  originId: string;

  constructor(props:Iprops) {
    this.position = props.position
    this.velocity = {
      x: randomNumBetween(-1.5, 1.5),
      y: randomNumBetween(-1.5, 1.5)
    }
    this.onSound = props.onSound
    this.onStopSound = props.onStopSound
    this.radius = 40;
    this.create = props.create;
    this.vertices = asteroidVertices(8, 40)
    this.color = '#FFFFFF';
    this.alpha = 0.1;
    this.ship = props.ship;
    this.fuel = 500
    this.isActive = false
    this.delete = false;
    this.originId = props.ship.player.id

  }
  destroy(byWho:string) {
    this.delete = true
  }

  public addInterferer(item:CanvasItem) {
    if (this.radarThreshold < 1) {
      this.playSound()
    }
    this.radarThreshold = 30 
  } 
  public removeInterferer(item:CanvasItem):void {

  }
  playSound():void{
    this.onSound({
      file: 'autoShieldActive',
      status: 'PLAYING'
    })
  }
  stopSound():void{
    this.onStopSound({
      file: 'autoShieldActive',
      status: 'STOPPED'
    })
  }

  render(state:IState, ctx:any) {

    if (this.radarThreshold > 0) {
      this.isActive = true
    } else {
      this.isActive = false
    }

    if (this.fuel <= 0) {
      this.isActive = false
      this.destroy('noFuel')
    }

    if (this.isActive) {
      this.alpha = 1

      this.fuel--
      this.radarThreshold--
    } else {
      if (this.fuel < 200) {
        this.alpha = 0.1
        if (this.flashInterval-- < 0) {
          this.alpha = 0
          this.flashInterval = randomNumBetween(10,40)
        }
      } else {
        this.alpha = 0.1
      }
      this.stopSound()
    }

    this.position.x = this.ship.position.x;
    this.position.y = this.ship.position.y;

    const circle = (_ctx:CanvasRenderingContext2D, x:number, y:number, r:number, c:string) => {
      _ctx.beginPath()
      var rad = _ctx.createRadialGradient(x, y, 1, x, y, r)
      rad.addColorStop(0.7, 'rgba('+c+',0)')
      rad.addColorStop(1, 'rgba('+c+',1)')
      _ctx.fillStyle = rad
      _ctx.arc(x, y, r, 0, Math.PI*2, false)
      _ctx.closePath()
      _ctx.fill()

    }
    const context = ctx
    if (!context) {
      return
    }

    // Draw
    context.save()
    context.translate(this.position.x, this.position.y)

    context.lineWidth = 2
    context.globalAlpha = this.alpha
    context.beginPath()
    circle(context, 0, 0, this.radius, '255,255,255')
    context.restore()
  }
}
