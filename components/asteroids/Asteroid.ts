import Particle from './Particle';
import { asteroidVertices, randomNumBetween } from './helpers';
import type { CanvasItem, IState, Iposition} from './game.types'

export interface Iastroid extends CanvasItem {
  position: Iposition,
  velocity: Iposition,
  rotation: number,
  rotationSpeed: number,
  radius: number,
  score: number,
  addScore: Function,
  onSound: Function,
  destroy: Function,
  vertices: [],
}

export interface Iprops {
  position: Iposition,
  size: number,
  create:Function,
  addScore: Function,
  onSound: Function,
  additionalScore?: number,
}


export default class Asteroid {
  type;
  position;
  vertices;
  rotation;
  score;
  velocity:Iposition;
  create;
  addScore;
  onSound;
  radius;
  rotationSpeed;
  delete;
  public isInRadar;
  id: number;
  originId: string;


  constructor(props: Iprops) {
    this.type = 'asteroid'
    this.position = props.position
    this.velocity = {
      x: randomNumBetween(-1.5, 1.5),
      y: randomNumBetween(-1.5, 1.5),
    }
    this.originId = 'space'
    this.rotation = 0;
    this.rotationSpeed = randomNumBetween(-1, 1)
    this.radius = props.size;
    const additionalScore:number = props.additionalScore || 0
    this.score = Math.floor(((80/this.radius)*5) + additionalScore);
    this.create = props.create;
    this.addScore = props.addScore;
    this.onSound = props.onSound;
    this.vertices = asteroidVertices(8, props.size)
    this.delete = false
    this.isInRadar = false
    this.id = Date.now() + randomNumBetween(0, 100000)

  }

  destroy(objectType:string, originId?:string):void {
    
    if (objectType !== 'nova') {
      this.onSound({
        file: 'asteroidHit',
        status: 'PLAYING'
      })
    }
    
    this.delete = true;
    this.addScore(this.score, originId);
    // Explode
      const runs = this.radius
      for (let i = 0; i < runs; i++) {
        const particle = new Particle({
          lifeSpan: randomNumBetween(10, 30),
          size: randomNumBetween(1, 3),
          position: {
            x: this.position.x + randomNumBetween(-this.radius/4, this.radius/4),
            y: this.position.y + randomNumBetween(-this.radius/4, this.radius/4)
          },
          velocity: {
            x: randomNumBetween(-1.5, 1.5),
            y: randomNumBetween(-1.5, 1.5)
          },
        });
        this.create(particle, 'particles');
      }

    // Break into smaller asteroids
    const len = objectType === 'shield' ? 1 : 2

    if (this.radius > 10){
      for (let i = 0; i < len; i++) {
        let asteroid = new Asteroid({

          size: this.radius/2,
          position: {
            x: randomNumBetween(-10, 20)+this.position.x,
            y: randomNumBetween(-10, 20)+this.position.y
          },
          create: this.create,
          addScore: this.addScore,
          onSound: this.onSound,
        });
        this.create(asteroid);
      }
    }

  }

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

    // Screen edges
    if (state.inifityScreen) {
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
    } else {

      let x = this.velocity.x
      let y = this.velocity.y
      
      if (this.position.x + this.radius > state.screen.width) {
        this.onSound({
          file: 'klink',
          status: 'PLAYING'
        })
        x = -this.velocity.x;
        this.position.x = state.screen.width - this.radius - 3;
      } else if(this.position.x - this.radius < 0){
        this.onSound({
          file: 'klink',
          status: 'PLAYING'
        })
        x = -this.velocity.x
        this.position.x = 0 + this.radius
        
      }
      if (this.position.y + this.radius > state.screen.height) {
        this.onSound({
          file: 'klink',
          status: 'PLAYING'
        })
        y = -this.velocity.y;
        this.position.y = state.screen.height - this.radius - 3;
      } else if (this.position.y - this.radius < 0) {
        this.onSound({
          file: 'klink',
          status: 'PLAYING'
        })
        y = -this.velocity.y
        this.position.y = 0 + this.radius
      }

      const newVelocity = {x,y}
      this.velocity = newVelocity
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
