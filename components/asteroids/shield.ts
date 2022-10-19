import Particle from './Particle';
import { asteroidVertices, randomNumBetween } from './helpers';
import { addInterval, removeInterval } from './gameIntervalHandler'
import type { IState, Iposition, CanvasItem} from './game.types'

let classRoot = this;
export interface Iprops {
  position:Iposition,
  onSound:Function,
  create:Function,
  ship:CanvasItem,
  updateShieldFuel:Function,
}
export interface IShield extends CanvasItem {}

export default class Shield {
  type:string;
  velocity: Iposition;
  position: Iposition;
  onSound: Function;
  create:Function;
  radius: number;
  vertices;
  color:string;
  alpha:number;
  ship;
  fuel:number;
  isActive:boolean;
  delete:boolean;
  updateShieldFuel:Function

  constructor(props:Iprops) {
    this.type = 'shield'
    this.position = props.position
    this.velocity = {
      x: randomNumBetween(-1.5, 1.5),
      y: randomNumBetween(-1.5, 1.5)
    }
    this.onSound = props.onSound
    this.radius = 40;
    this.create = props.create;
    this.vertices = asteroidVertices(8, 40)
    this.color = '#FFFFFF';
    this.alpha = 1;
    this.ship = props.ship;
    //this.upgrade = props.upgrade;
    this.type = 'default'
    //this.topRoot = props.topRoot
    this.fuel = 500
    this.updateShieldFuel = props.updateShieldFuel
    this.isActive = false
    this.delete = false;
    this.updateShieldFuel(this.fuel)
  }
  selfDestruction() {

  }
  destroy(byWho:string) {
    removeInterval('ShieldSelfDestructionInterval')
    this.updateShieldFuel(0)
    this.delete = true
  }

  render(state:IState, ctx:any) {

    if (this.fuel <= 0) {
      this.destroy('noFuel')
    }
    if (this.ship.delete) {
      this.destroy('noShip')
    }
    if (state.keys.weapon) {
      this.alpha = 1
      this.fuel--
      this.updateShieldFuel(this.fuel)
      if (!this.isActive) {
        this.onSound({
          file: 'shieldUp',
          status: 'PLAYING'
        })
        this.isActive = true
      }
    } else {
      this.alpha = 0
      this.isActive = false
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
      //_ctx.strokeStyle = this.color
      //_ctx.stroke()
    }
    const context = ctx
    if (!context) {
      return
    }

    // Draw
    context.save()
    context.translate(this.position.x, this.position.y)
    //context.rotate(1 * Math.PI / 180) // this.rotation

    context.lineWidth = 2
    context.globalAlpha = this.alpha
    context.beginPath()
    circle(context, 0, 0, this.radius, '255,255,255')
    context.restore()
  }
}
