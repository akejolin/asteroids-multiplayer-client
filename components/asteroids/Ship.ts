import Bullet from './Bullet';
import Particle from './Particle';
import { rotatePoint, randomNumBetween } from './helpers';
import type { IState, Iposition} from './game.types'
import type { IshipWeapon } from './game.types'

export interface Iprops {
  position: Iposition,
  create:Function,
  onSound: Function,
  onDie: Function,
  currentWeapond?: string,
  lastShotLimit?: number,
  player: any,
}

interface IcurrentWeapon extends IshipWeapon {
  lifeSpan: number
}

export default class Ship {
  type: string;
  position: Iposition;
  weapondDefault:IshipWeapon;
  weaponCurrent:IshipWeapon;
  velocity: Iposition;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  inertia: number;
  onSound: Function;
  create: Function;
  onDie: Function;

  lastShot: number;
  lastShotLimit: number;
  delete: boolean;
  imgShip: HTMLImageElement;
  player: any;
  id: number;

  constructor(props: Iprops) {
    this.id = Date.now() + randomNumBetween(0, 100000)
    this.type = 'ship'
    this.weapondDefault = {
      type: 'default',
      size: 2,
      range: 400,
      lastShotLimit: 170,
      duration:0
    } as IcurrentWeapon
    this.weaponCurrent = this.weapondDefault

    this.position = props.position as Iposition
    this.velocity = {
      x: 0,
      y: 0
    }
    this.player = props.player
    this.onSound = props.onSound
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 20;
    this.lastShot = 0;
    this.lastShotLimit = props.lastShotLimit || 170
    this.create = props.create;
    this.onDie = props.onDie;
    this.imgShip = new Image();
    this.imgShip.src = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjEuMyAzOC43IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyMS4zIDM4Ljc7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPi5zdDB7ZmlsbDojRkZGRkZGO30uc3Qxe2ZpbGw6bm9uZTt9PC9zdHlsZT48Zz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTguOSwyM2MyLjMsNC43LDIuNiw5LjcsMS4zLDE1Yy0xLjUtMS4zLTIuOS0yLjUtNC4zLTMuN2MtMC40LTAuMy0wLjItMC43LTAuMS0xLjFDMTcsMjkuOSwxNy45LDI2LjUsMTguOSwyM3oiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMS4yLDM4Qy0wLjEsMzIuOCwwLDI4LDIuNywyMy4zYzAuNiwxLjIsMC43LDIuNCwxLDMuNmMwLjYsMi4xLDEuMiw0LjIsMS45LDYuM2MwLjIsMC41LDAuMiwwLjktMC4yLDEuM0M0LDM1LjYsMi43LDM2LjcsMS4yLDM4eiIvPjxnPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMy4zLDIuNGMtMi45LTIuNS0yLjQtMi4yLTUtMC4yYy0zLjgsMy4xLTYsNy4xLTUuOCwxMi4xQzMsMjEuMyw1LDI3LjksNy4xLDM0LjZjMC4yLDAuNiwwLjQsMC44LDEuMSwwLjZjMS43LTAuNiwzLjUtMC42LDUuMiwwYzAuNywwLjIsMC45LDAsMS4xLTAuNmMwLjUtMS42LDEtMy4yLDEuNS00LjhjMS40LTUuMSwyLjgtMTAuMiwyLjktMTMuOEMxOSw5LjMsMTYuOSw1LjUsMTMuMywyLjR6IE03LjcsNC44bC0zLjUsOUM0LjcsMTAuNSw2LjEsNy42LDcuNyw0Ljh6IE0xMC43LDE4LjhjLTIuMSwwLTMuNy0xLjYtMy44LTMuN2MwLTIsMS43LTMuNywzLjgtMy43YzIuMSwwLDMuNywxLjUsMy43LDMuN0MxNC41LDE3LjMsMTIuOSwxOC44LDEwLjcsMTguOHoiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTAuOCwxMS40Yy0yLjEsMC0zLjksMS43LTMuOCwzLjdjMCwyLDEuNywzLjYsMy44LDMuN2MyLjIsMCwzLjgtMS41LDMuOC0zLjdDMTQuNSwxMi45LDEzLDExLjQsMTAuOCwxMS40eiBNMTIuNywxNS42bC0wLjctMi40QzEyLjgsMTMuOCwxMywxNC40LDEyLjcsMTUuNnoiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNNC4zLDEzLjhsMy41LTlDNi4xLDcuNiw0LjcsMTAuNSw0LjMsMTMuOHoiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTEuOSwxMy4ybDAuNywyLjRDMTMsMTQuNCwxMi44LDEzLjgsMTEuOSwxMy4yeiIvPjwvZz48L2c+PC9zdmc+';
    this.delete = false
  }

  destroy(byWho:string){
    this.delete = true;
    this.onSound({
      file: 'crash',
      status: 'PLAYING'
    })
    // Explode
    for (let i = 0; i < 20; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(10, 30),
        size: randomNumBetween(1, 4),
        position: {
          x: this.position.x + randomNumBetween(-this.radius/4, this.radius/4),
          y: this.position.y + randomNumBetween(-this.radius/4, this.radius/4)
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      });
      this.create(particle, 'particles');
    }
  }

  rotate(dir:string){
    if (dir == 'LEFT') {
      this.rotation -= this.rotationSpeed;
    }
    if (dir == 'RIGHT') {
      this.rotation += this.rotationSpeed;
    }
  }

  accelerate(){
    this.velocity.x -= Math.sin(-this.rotation*Math.PI/180) * this.speed;
    this.velocity.y -= Math.cos(-this.rotation*Math.PI/180) * this.speed;

    // Thruster particles
    let posDelta = rotatePoint({x:0, y:-10}, {x:0,y:0}, (this.rotation-180) * Math.PI / 180);
    const particle = new Particle({
      lifeSpan: randomNumBetween(5, 10),
      size: randomNumBetween(0.5, 2),
      position: {
        x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
        y: this.position.y + posDelta.y + randomNumBetween(-2, 2)
      },
      velocity: {
        x: posDelta.x / randomNumBetween(3, 5),
        y: posDelta.y / randomNumBetween(3, 5)
      }
    });
    this.create(particle, 'particles');
  }
  playKlinkSound():void{
    this.onSound({
      file: 'klink',
      status: 'PLAYING'
    })
  }

  render(state:IState, ctx:any):void {

    const {keys} = this.player

    // Controls
    if (keys.up) {
      this.accelerate();
    }
    if (keys.left) {
      this.rotate('LEFT');
    }
    if (keys.right) {
      this.rotate('RIGHT');
    }

    if (keys.space && Date.now() - this.lastShot > this.lastShotLimit) {
      switch(this.weaponCurrent.type) {
        default:
          const bullet3 = new Bullet({
            ship: this,
            size: this.weaponCurrent.size,
            range: this.weaponCurrent.range,
          })
          this.create(bullet3, 'bullets');
        break;
      }
      this.lastShot = Date.now();
    }

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Rotation
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

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
    const context = ctx;
    if (context) {
      context.save();
      context.translate(this.position.x, this.position.y);
      context.rotate(this.rotation * Math.PI / 180);
      context.strokeStyle = '#ffffff';
      context.fillStyle = '#000000';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, -15);
      context.lineTo(10, 10);
      context.lineTo(5, 7);
      context.lineTo(-5, 7);
      context.lineTo(-10, 10);
      context.closePath();

      context.font = "12px Arial";
      context.fillStyle = "white";
      context.fillText(`${this.player.name}, ⭐: ${this.player.score}`, 5, 50);

      context.drawImage(this.imgShip, 22 / 2 * (-1), 18 * (-1), 22, 39);
      context.restore();
    }
  }
}
