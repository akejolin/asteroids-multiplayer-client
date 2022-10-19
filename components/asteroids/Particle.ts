import type { CanvasItem, IState, Iposition} from './game.types'
export interface Iastroid extends CanvasItem {
  position: Iposition,
  velocity: Iposition,
  radius: number,
  lifeSpan: number,
  inertia: number,
}
export interface Iprops {
  position: Iposition,
  velocity: Iposition,
  size:number,
  lifeSpan: number,
}

  export default class Particle {
    type;
    delete;
    position;
    velocity;
    radius;
    lifeSpan;
    inertia;

  constructor(props:Iprops) {
    this.type = 'particle'
    this.position = props.position
    this.velocity = props.velocity
    this.radius = props.size;
    this.lifeSpan = props.lifeSpan;
    this.inertia = 0.78;
    this.delete = false;
  }

  destroy(byWho?:string){
    this.delete = true;
  }

  render(state:IState, ctx:any){
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Shrink
    this.radius -= 0.15;
    if(this.radius < 0.15) {
      this.radius = 0.15;
    }
    if(this.lifeSpan-- < 0){
      this.destroy()
    }

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
