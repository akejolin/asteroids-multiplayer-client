import { asteroidVertices, randomNumBetween } from './helpers';
import type { CanvasItem, IState, Iposition} from './game.types'

export interface Iprops {
  position?: Iposition,
  velocity?: Iposition;
  radius?: number,
  screen: { width:number, height:number }
}

export default class Star {
  type;
  position;
  vertices;
  rotation;
  velocity: Iposition;
  radius;
  rotationSpeed;
  delete;
  originId: string;


  constructor(props: Iprops) {
    this.type = 'star'
    this.position = props.position || {
      x: randomNumBetween(0, props.screen.width),
      y: randomNumBetween(0, props.screen.height),
    }
    this.velocity = props.velocity || {
      x: 0, //randomNumBetween(-1.5, 1.5),
      y: 0.2 //randomNumBetween(-1.5, 1.5),
    }
    this.originId = 'space'
    this.rotation = 0;
    this.rotationSpeed = randomNumBetween(-1, 1)
    this.radius = props.radius || 1;
    this.vertices = asteroidVertices(8, this.radius)
    this.delete = false
  }

  destroy(byWho:string):void {}

  render(state:IState, ctx:any):void {

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Rotation
    this.rotation += this.rotationSpeed;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Infinity edges
    if (this.position.x > state.screen.width + this.radius) {
      this.position.x = -this.radius;
    } else if(this.position.x < -this.radius){
      this.position.x = state.screen.width + this.radius;
    }
    if (this.position.y > state.screen.height + this.radius) {
        this.position.y = -this.radius;
    } else if (this.position.y < -this.radius) {
      this.position.y = state.screen.height + this.radius;
    }

    // Draw
    const context = ctx 
    if (context) {
      context.save();
      context.translate(this.position.x, this.position.y);
      //context.rotate(this.rotation * Math.PI / 180);
      context.strokeStyle = '#FFF';
      context.fillStyle = '#ffffff';
      context.globalAlpha = .2
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, - this.radius);
      for (let i = 1; i < this.vertices.length; i++) {
        context.lineTo(this.vertices[i].x, this.vertices[i].y);
      }
      context.closePath();
      context.clip();
      context.stroke();
      context.fill();

      context.restore();
    }
  }
}
