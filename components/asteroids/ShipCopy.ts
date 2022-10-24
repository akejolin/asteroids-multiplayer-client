import type { IState, Iposition} from './game.types'

export interface Iprops {
  type: string;
  position: Iposition;
  velocity: Iposition;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  inertia: number;
  imgShip: HTMLImageElement;
  player: any;
  id: number;
}

export default class ShipCopy {
  type: string;
  position: Iposition;
  velocity: Iposition;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  inertia: number;
  imgShip: HTMLImageElement;
  player: any;
  id: number;

  constructor(props: Iprops) {
    this.id = props.id
    this.type = props.type
    this.position = props.position as Iposition
    this.velocity = props.velocity
    this.player = props.player

    this.rotation = props.rotation;
    this.rotationSpeed = props.rotationSpeed;
    this.speed = props.speed;
    this.inertia = props.inertia;
    this.radius = props.radius;
    this.imgShip = new Image();
    this.imgShip.src = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjEuMyAzOC43IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyMS4zIDM4Ljc7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPi5zdDB7ZmlsbDojRkZGRkZGO30uc3Qxe2ZpbGw6bm9uZTt9PC9zdHlsZT48Zz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTguOSwyM2MyLjMsNC43LDIuNiw5LjcsMS4zLDE1Yy0xLjUtMS4zLTIuOS0yLjUtNC4zLTMuN2MtMC40LTAuMy0wLjItMC43LTAuMS0xLjFDMTcsMjkuOSwxNy45LDI2LjUsMTguOSwyM3oiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMS4yLDM4Qy0wLjEsMzIuOCwwLDI4LDIuNywyMy4zYzAuNiwxLjIsMC43LDIuNCwxLDMuNmMwLjYsMi4xLDEuMiw0LjIsMS45LDYuM2MwLjIsMC41LDAuMiwwLjktMC4yLDEuM0M0LDM1LjYsMi43LDM2LjcsMS4yLDM4eiIvPjxnPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMy4zLDIuNGMtMi45LTIuNS0yLjQtMi4yLTUtMC4yYy0zLjgsMy4xLTYsNy4xLTUuOCwxMi4xQzMsMjEuMyw1LDI3LjksNy4xLDM0LjZjMC4yLDAuNiwwLjQsMC44LDEuMSwwLjZjMS43LTAuNiwzLjUtMC42LDUuMiwwYzAuNywwLjIsMC45LDAsMS4xLTAuNmMwLjUtMS42LDEtMy4yLDEuNS00LjhjMS40LTUuMSwyLjgtMTAuMiwyLjktMTMuOEMxOSw5LjMsMTYuOSw1LjUsMTMuMywyLjR6IE03LjcsNC44bC0zLjUsOUM0LjcsMTAuNSw2LjEsNy42LDcuNyw0Ljh6IE0xMC43LDE4LjhjLTIuMSwwLTMuNy0xLjYtMy44LTMuN2MwLTIsMS43LTMuNywzLjgtMy43YzIuMSwwLDMuNywxLjUsMy43LDMuN0MxNC41LDE3LjMsMTIuOSwxOC44LDEwLjcsMTguOHoiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTAuOCwxMS40Yy0yLjEsMC0zLjksMS43LTMuOCwzLjdjMCwyLDEuNywzLjYsMy44LDMuN2MyLjIsMCwzLjgtMS41LDMuOC0zLjdDMTQuNSwxMi45LDEzLDExLjQsMTAuOCwxMS40eiBNMTIuNywxNS42bC0wLjctMi40QzEyLjgsMTMuOCwxMywxNC40LDEyLjcsMTUuNnoiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNNC4zLDEzLjhsMy41LTlDNi4xLDcuNiw0LjcsMTAuNSw0LjMsMTMuOHoiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTEuOSwxMy4ybDAuNywyLjRDMTMsMTQuNCwxMi44LDEzLjgsMTEuOSwxMy4yeiIvPjwvZz48L2c+PC9zdmc+';

  }

  render(state:IState, ctx:any):void {

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

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
