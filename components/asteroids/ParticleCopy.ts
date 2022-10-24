import type { IState, Iposition} from './game.types'

export interface Iprops {
  position: Iposition,
  velocity: Iposition,
  size: number,
  radius: number,
  lifeSpan: number,
  inertia: number,
}

  export default class Particle {
    type;
    position;
    velocity;
    radius;
    lifeSpan;
    inertia;

  constructor(props:Iprops) {
    this.type = 'particle'
    this.position = props.position
    this.velocity = props.velocity
    this.radius = props.radius;
    this.lifeSpan = props.lifeSpan;
    this.inertia = props.inertia || 0.78;
  }

  render(state:IState, ctx:any){

    // Draw
    const context = ctx;
    if (context){
      context.save();
      context.translate(this.position.x, this.position.y);
      context.fillStyle = '#ffffff';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, -this.radius);
      context.arc(0, 0, this.radius, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      context.restore();
    }
  }
}
