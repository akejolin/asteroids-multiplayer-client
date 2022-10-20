import Particle from './Particle';
import Bullet from './Bullet';
import { asteroidVertices, randomNumBetween, findAngle, rotatePoint } from './helpers';
import { themes } from './color-theme'

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
  vertices: Iposition[],
}

export interface Iprops {
  position: Iposition,
  size:number,
  create:Function,
  addScore:Function,
  onSound:Function,
  onDie?:Function,
  additionalScore?: number,
  target:CanvasItem,
  type:string;
}

export default class Ufo {

  type:string;
  position: Iposition;
  velocity: Iposition;
  vertices: Iposition[];
  rotation: number;
  radius: number;
  rotationSpeed: number;
  score:number = 1000;
  additionalScore:number;
  target: CanvasItem;
  create:Function;
  addScore:Function;
  onDie: Function;
  onSound: Function;
  delete: boolean = false;
  nextShotDelay: number;
  bulletColor: string;
  ufoImage: string;
  public isInRadar;
  id:number;
  originId: string;

  constructor(props:Iprops) {
    this.id = Date.now() + randomNumBetween(0, 100000)
    this.type = 'ufo'
    this.originId = 'space'
    this.position = props.position
    this.velocity = {
      x: randomNumBetween(-2.5, 2.5),
      y: randomNumBetween(-2.5, 2.5)
    }
    this.rotation = 0
    this.rotationSpeed = randomNumBetween(-1, 1)
    this.radius = props.size
    this.additionalScore = Number(props.additionalScore) || 0
    this.create = props.create
    this.addScore = props.addScore
    this.vertices = asteroidVertices(4, props.size)
    this.target = props.target
    this.onDie = props.onDie || function () {}
    this.onSound = props.onSound
    this.nextShotDelay = randomNumBetween(10, 1200);
    this.bulletColor = 'default';
    this.ufoImage = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4PSIwcHQiIHk9IjBwdCIgd2lkdGg9IjIwcHQiIGhlaWdodD0iMjBwdCIgdmlld0JveD0iMCAwIDIwIDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICA8ZyBpZD0iMSI+CiAgICA8dGl0bGU+TGF5ZXIgMjwvdGl0bGU+CiAgICA8Y2xpcFBhdGggaWQ9IjMiPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiMyIi8+CiAgICAgIDxwYXRoIGlkPSIyIiBkPSJNMi41LC0wLjAwMDEwMDEzNiBDMi41LC0wLjAwMDEwMDEzNiwxNy41LC0wLjAwMDEwMDEzNiwxNy41LC0wLjAwMDEwMDEzNiBDMTcuNSwtMC4wMDAxMDAxMzYsMTcuNSwxOS45OTk5LDE3LjUsMTkuOTk5OSBDMTcuNSwxOS45OTk5LDIuNSwxOS45OTk5LDIuNSwxOS45OTk5IEMyLjUsMTkuOTk5OSwyLjUsLTAuMDAwMTAwMTM2LDIuNSwtMC4wMDAxMDAxMzYgeiIvPgogICAgPC9jbGlwUGF0aD4KICAgIDxnIGlkPSI0IiBzdHlsZT0iY2xpcC1wYXRoOnVybCgjMyk7Ij4KICAgICAgPHRpdGxlPkNsaXBwaW5nIEdyb3VwPC90aXRsZT4KICAgICAgPGRlZnM+CiAgICAgICAgPHRpdGxlPlNoYXBlIDIxPC90aXRsZT4KICAgICAgICA8ZyBpZD0iNSI+CiAgICAgICAgICA8ZGVmcz4KICAgICAgICAgICAgPHBhdGggaWQ9IjYiIGQ9Ik05Ljc2OTUzLDAuMDAzNDE1NDkgQzUuNjY0NDUsMC4xMjY0NjIsMi41LDMuNzA3NzEsMi41LDcuODE0MzUgQzIuNSwxMS4yNTA4LDIuNSwxNC42ODczLDIuNSwxOC4xMjM3IEMyLjUsMTguNjgwOCwzLjE3MzA1LDE4Ljk1OTMsMy41NjY4LDE4LjU2NTUgQzMuODkxMjgsMTguMzI0Miw0LjIxNTc1LDE4LjA4Myw0LjU0MDIzLDE3Ljg0MTcgQzQuODAwMzksMTcuNjQ4Myw1LjE2NTIzLDE3LjY4NTgsNS4zODA0NywxNy45MjggQzUuOTM5NzEsMTguNTU3Niw2LjQ5ODk2LDE5LjE4NzEsNy4wNTgyLDE5LjgxNjcgQzcuMzAyMzQsMjAuMDYwOCw3LjY5ODA1LDIwLjA2MDgsNy45NDIxOSwxOS44MTY3IEM4LjQ3MjQsMTkuMjE5Nyw5LjAwMjYsMTguNjIyNyw5LjUzMjgxLDE4LjAyNTcgQzkuNzgxNjQsMTcuNzQ1NiwxMC4yMTg4LDE3Ljc0NTYsMTAuNDY3MiwxOC4wMjU3IEMxMC45OTc0LDE4LjYyMjcsMTEuNTI3NiwxOS4yMTk3LDEyLjA1NzgsMTkuODE2NyBDMTIuMzAyLDIwLjA2MDgsMTIuNjk3NywyMC4wNjA4LDEyLjk0MTgsMTkuODE2NyBDMTMuNTAxLDE5LjE4NzEsMTQuMDYwMywxOC41NTc2LDE0LjYxOTUsMTcuOTI4IEMxNC44MzQ4LDE3LjY4NTgsMTUuMTk5NiwxNy42NDc5LDE1LjQ1OTgsMTcuODQxNyBDMTUuNzg0MiwxOC4wODMsMTYuMTA4NywxOC4zMjQyLDE2LjQzMzIsMTguNTY1NSBDMTYuODI3LDE4Ljk1OTMsMTcuNSwxOC42ODA0LDE3LjUsMTguMTIzNyBDMTcuNSwxOC4xMjM3LDE3LjUsNy40OTk5LDE3LjUsNy40OTk5IEMxNy41LDMuMjgxMTUsMTQuMDE2OCwtMC4xMjM5MjgsOS43Njk1MywwLjAwMzQxNTQ5IHogTTcuNSw4Ljc0OTkgQzYuODA5NzcsOC43NDk5LDYuMjUsOC4xOTAxNCw2LjI1LDcuNDk5OSBDNi4yNSw2LjgwOTY3LDYuODA5NzcsNi4yNDk5LDcuNSw2LjI0OTkgQzguMTkwMjMsNi4yNDk5LDguNzUsNi44MDk2Nyw4Ljc1LDcuNDk5OSBDOC43NSw4LjE5MDE0LDguMTkwMjMsOC43NDk5LDcuNSw4Ljc0OTkgeiBNMTIuNSw4Ljc0OTkgQzExLjgwOTgsOC43NDk5LDExLjI1LDguMTkwMTQsMTEuMjUsNy40OTk5IEMxMS4yNSw2LjgwOTY3LDExLjgwOTgsNi4yNDk5LDEyLjUsNi4yNDk5IEMxMy4xOTAyLDYuMjQ5OSwxMy43NSw2LjgwOTY3LDEzLjc1LDcuNDk5OSBDMTMuNzUsOC4xOTAxNCwxMy4xOTAyLDguNzQ5OSwxMi41LDguNzQ5OSB6Ii8+CiAgICAgICAgICA8L2RlZnM+CiAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiM2IiBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO29wYWNpdHk6MTtzdHJva2U6bm9uZTsiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZGVmcz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjNSIvPgogICAgPC9nPgogICAgPGNsaXBQYXRoIGlkPSI4Ij4KICAgICAgPHVzZSB4bGluazpocmVmPSIjNyIvPgogICAgICA8cGF0aCBpZD0iNyIgZD0iTTIuNSwtMC4wMDAxMDAxMzYgQzIuNSwtMC4wMDAxMDAxMzYsMTcuNSwtMC4wMDAxMDAxMzYsMTcuNSwtMC4wMDAxMDAxMzYgQzE3LjUsLTAuMDAwMTAwMTM2LDE3LjUsMTkuOTk5OSwxNy41LDE5Ljk5OTkgQzE3LjUsMTkuOTk5OSwyLjUsMTkuOTk5OSwyLjUsMTkuOTk5OSBDMi41LDE5Ljk5OTksMi41LC0wLjAwMDEwMDEzNiwyLjUsLTAuMDAwMTAwMTM2IHoiLz4KICAgIDwvY2xpcFBhdGg+CiAgICA8ZyBpZD0iOSIgc3R5bGU9ImNsaXAtcGF0aDp1cmwoIzgpOyI+CiAgICAgIDxkZWZzPgogICAgICAgIDxnIGlkPSIxMCI+CiAgICAgICAgICA8ZGVmcz4KICAgICAgICAgICAgPHBhdGggaWQ9IjExIiBkPSJNOS43Njk1MywwLjAwMzQxNTQ5IEM1LjY2NDQ1LDAuMTI2NDYyLDIuNSwzLjcwNzcxLDIuNSw3LjgxNDM1IEMyLjUsMTEuMjUwOCwyLjUsMTQuNjg3MywyLjUsMTguMTIzNyBDMi41LDE4LjY4MDgsMy4xNzMwNSwxOC45NTkzLDMuNTY2OCwxOC41NjU1IEMzLjg5MTI4LDE4LjMyNDIsNC4yMTU3NSwxOC4wODMsNC41NDAyMywxNy44NDE3IEM0LjgwMDM5LDE3LjY0ODMsNS4xNjUyMywxNy42ODU4LDUuMzgwNDcsMTcuOTI4IEM1LjkzOTcxLDE4LjU1NzYsNi40OTg5NiwxOS4xODcxLDcuMDU4MiwxOS44MTY3IEM3LjMwMjM0LDIwLjA2MDgsNy42OTgwNSwyMC4wNjA4LDcuOTQyMTksMTkuODE2NyBDOC40NzI0LDE5LjIxOTcsOS4wMDI2LDE4LjYyMjcsOS41MzI4MSwxOC4wMjU3IEM5Ljc4MTY0LDE3Ljc0NTYsMTAuMjE4OCwxNy43NDU2LDEwLjQ2NzIsMTguMDI1NyBDMTAuOTk3NCwxOC42MjI3LDExLjUyNzYsMTkuMjE5NywxMi4wNTc4LDE5LjgxNjcgQzEyLjMwMiwyMC4wNjA4LDEyLjY5NzcsMjAuMDYwOCwxMi45NDE4LDE5LjgxNjcgQzEzLjUwMSwxOS4xODcxLDE0LjA2MDMsMTguNTU3NiwxNC42MTk1LDE3LjkyOCBDMTQuODM0OCwxNy42ODU4LDE1LjE5OTYsMTcuNjQ3OSwxNS40NTk4LDE3Ljg0MTcgQzE1Ljc4NDIsMTguMDgzLDE2LjEwODcsMTguMzI0MiwxNi40MzMyLDE4LjU2NTUgQzE2LjgyNywxOC45NTkzLDE3LjUsMTguNjgwNCwxNy41LDE4LjEyMzcgQzE3LjUsMTguMTIzNywxNy41LDcuNDk5OSwxNy41LDcuNDk5OSBDMTcuNSwzLjI4MTE1LDE0LjAxNjgsLTAuMTIzOTI4LDkuNzY5NTMsMC4wMDM0MTU0OSB6IE03LjUsOC43NDk5IEM2LjgwOTc3LDguNzQ5OSw2LjI1LDguMTkwMTMsNi4yNSw3LjQ5OTkgQzYuMjUsNi44MDk2Nyw2LjgwOTc3LDYuMjQ5OSw3LjUsNi4yNDk5IEM4LjE5MDIzLDYuMjQ5OSw4Ljc1LDYuODA5NjcsOC43NSw3LjQ5OTkgQzguNzUsOC4xOTAxMyw4LjE5MDIzLDguNzQ5OSw3LjUsOC43NDk5IHogTTEyLjUsOC43NDk5IEMxMS44MDk4LDguNzQ5OSwxMS4yNSw4LjE5MDEzLDExLjI1LDcuNDk5OSBDMTEuMjUsNi44MDk2NywxMS44MDk4LDYuMjQ5OSwxMi41LDYuMjQ5OSBDMTMuMTkwMiw2LjI0OTksMTMuNzUsNi44MDk2NywxMy43NSw3LjQ5OTkgQzEzLjc1LDguMTkwMTMsMTMuMTkwMiw4Ljc0OTksMTIuNSw4Ljc0OTkgeiIvPgogICAgICAgICAgPC9kZWZzPgogICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjMTEiIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87b3BhY2l0eToxO3N0cm9rZTpub25lOyIvPgogICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjMTEiIHN0eWxlPSJmaWxsOm5vbmU7b3BhY2l0eToxO3N0cm9rZTojZmZmZmZmO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS1vcGFjaXR5OjE7c3Ryb2tlLXdpZHRoOjE7Ii8+CiAgICAgICAgPC9nPgogICAgICA8L2RlZnM+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iIzEwIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K';
    /*
    this.image = props.image;
    this.imageWidth = props.imageWidth;
    this.imageHeight = props.imageHeight;

    this.img = new Image();
    this.img.src = props.image || "";
    */
    this.type= props.type;

    this.onSound({
      file: 'enemyShowUp',
      status: 'PLAYING',
    })
    this.isInRadar = false;

  }
  generateNewShoot() {
    this.nextShotDelay = randomNumBetween(10, 1200),
    this.shoot()
  }
  shoot() {
    const bullet = new Bullet({
      ship: this,
      size: 3,
      range: 1000,
      color: this.bulletColor,
      onSound: this.onSound,
    })
    this.onSound({
      file: 'enemyShot',
      status: 'PLAYING'
    })
    this.create(bullet, 'ufoBullets');
  }
  destroy(objectType:string, originId:string) {
    this.delete = true;
    this.onDie();
    this.addScore(this.score, originId);
    this.onSound({
      file: 'crash',
      status: 'PLAYING'
    })
    // Explode
    for (let i = 0; i < 60; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x: this.position.x + randomNumBetween(-this.radius/4, this.radius/4),
          y: this.position.y + randomNumBetween(-this.radius/4, this.radius/4)
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      })
      this.create(particle, 'particles')
    }
  }

  render(state:IState, ctx:any):void {

    if(this.bulletColor === 'default') {
      this.bulletColor = themes[state.colorThemeIndex].enemyBullet
    }


    if (this.nextShotDelay-- < 0) {
      this.generateNewShoot()
    }


    let _rotation = findAngle(this.target.position, this.position)
    _rotation = Math.round(_rotation + 272)

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Rotation
    this.rotation = _rotation

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
      
      if (this.position.x + this.radius> state.screen.width) {
        x = -this.velocity.x;
        this.position.x = state.screen.width - this.radius - 3;
      } else if(this.position.x - this.radius < 0){
        x = -this.velocity.x
        this.position.x = 0 + this.radius
      }
      if (this.position.y + this.radius > state.screen.height) {
        y = -this.velocity.y;
        this.position.y = state.screen.height - this.radius - 3;
      } else if (this.position.y - this.radius < 0) {
        y = -this.velocity.y
        this.position.y = 0 + this.radius
      }

      const newVelocity = {x,y}
      this.velocity = newVelocity
    }

    // Draw
    const context = ctx;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.strokeStyle = themes[state.colorThemeIndex].enemy
    context.fillStyle = themes[state.colorThemeIndex].enemy // ef404f
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
    
    //const img = new Image();
    //img.src = this.ufoImage
    //context.drawImage(img, this.radius / 2 * (-1), this.radius / 2 * (-1), 30, 30);
    /*
    if (this.img !== "") {
      context.drawImage(this.img, this.radius / 2 * (-1), this.radius / 2 * (-1), 85, 85);
    }
    */
    context.restore();
  }
}
