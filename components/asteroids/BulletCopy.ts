import { rotatePoint } from './helpers';
import {themes} from './color-theme'
import { randomNumBetween } from './helpers';

import type { CanvasItem, IState, Iposition, iBullet} from './game.types'

export interface Iprops {
  size: number;
  color: string;
  lifeSpan: number;
  rotation: number;
  position: Iposition;
  velocity: Iposition;
  radius: number;
}

export default class Bullet {
  type:string;
  rotation: number;
  position: Iposition;
  radius: number;
  lifeSpan: number
  color: string;
  id:number; 

  constructor(props:Iprops) {
    this.id = Date.now() + randomNumBetween(0, 100000)
    this.type = 'bullet'
    this.rotation = props.rotation;
    this.position = props.position;
    this.color = props.color ? props.color : 'default'
    this.lifeSpan = props.lifeSpan ? props.lifeSpan : 50
    this.radius = props.radius;
  }

  render(state:IState, ctx:any):void {
    // Draw
    const context = ctx
    if(context) {
      context.save()
      context.translate(this.position.x, this.position.y)
      context.rotate(this.rotation * Math.PI / 180)
      context.fillStyle = this.color
      context.lineWidth = 0.5
      context.beginPath()
      context.arc(0, 0, this.radius, 0, this.radius * Math.PI)
      context.closePath()
      context.fill()
      context.restore()
    }
  }
}
