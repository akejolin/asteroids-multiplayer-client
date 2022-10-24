import Particle from './Particle';
import { asteroidVertices, randomNumBetween } from './helpers';
import type { CanvasItem, IState, Iposition} from './game.types'


export interface Iprops {
  position: Iposition,
  velocity: Iposition,
  rotationSpeed: number,
  rotation: number,
  size: number,
  create:Function,
  onSound: Function,
  additionalScore?: number,
  that: any,
  vertices: [],
  id: string,
}


export default class Asteroid {
  type;
  position: Iposition;
  velocity: Iposition;
  rotation: number;
  rotationSpeed: number;
  radius: number;
  vertices: Iposition[];
  originId: string;
  that: any;
  id:string;


  constructor(props: Iprops) {

    this.type = 'asteroid'
    this.position = props.position
    this.velocity = props.velocity
    this.originId = 'space'
    this.rotation = props.rotation;
    this.rotationSpeed = props.rotationSpeed
    this.radius = props.size;

    this.vertices = props.vertices
    this.id = props.id

  }

  render(state:IState, ctx:any):void {

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Rotation
    this.rotation += this.rotationSpeed;
    /*
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }
    */

    // Screen edges
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
    const context = ctx //state.context;
    if (context) {
      context.save();
      context.translate(this.position.x, this.position.y);
      context.rotate(this.rotation * Math.PI / 180);
      context.strokeStyle = '#FFF';
      context.fillStyle = '#ffffff';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, -this.radius);
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
