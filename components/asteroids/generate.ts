import Asteroid from './Asteroid'
import AsteroidCopy from './AsteroidCopy'
import Ship from './Ship'
import ShipCopy from './ShipCopy'
import Star from './star'
import ParticleCopy from './ParticleCopy'
import BulletCopy from './BulletCopy'
import {randomNumBetweenExcluding} from './helpers'
import type {
    CanvasItem,
    CanvasItemGroups,
    Iposition,
} from './game.types'

    export const generateStars = (that:any) => {
      const array = Array.apply(null, Array(70)).map(()=>{})
      array.forEach(element => {
        let star = new Star({
          screen: that.state.screen,
        })
        that.createObject(star, 'stars')
      });
    }


export const generateAsteroids = (that:any, amount:number) => {
    let ship = that.canvasItemsGroups['ships'].find((item:CanvasItem)=> item.type === 'ship' && item.delete === false) || {
      position: { x: 0, y: 0} as Iposition
    };

    for (let i = 0; i < amount; i++) {
      let asteroid = new Asteroid({
        size: 80,
        position: {
          x: randomNumBetweenExcluding(0, that.state.screen.width, ship.position.x - 180, ship.position.x + 180),
          y: randomNumBetweenExcluding(0, that.state.screen.height, ship.position.y - 180, ship.position.y + 180)
        },
        create: that.createObject,
        addScore: that.addScore.bind(that) ? that.addScore.bind(that) : () => {},
        onSound: that.onSound.bind(that) ? that.onSound.bind(that) : () => {},
      });
      that.createObject(asteroid, 'asteroids');
    }
  }
  export const copyAsteroids = (that:any, origin: any) => {
      return new AsteroidCopy({
        position: origin.position,
        velocity: origin.velocity,
        rotationSpeed: origin.rotationSpeed,
        rotation: origin.rotation,
        size: origin.size,
        create: that.createObject,
        onSound: that.onSound.bind(that) ? that.onSound.bind(that) : () => {},
        that,
        vertices: origin.vertices,
        id: origin.id,
      });
  }
  export const copyShips = (that:any, origin: any) => {
    return new ShipCopy({
      type: origin.type,
      position: origin.position,
      velocity: origin.velocity,
      radius: origin.radius,
      rotation: origin.rotation,
      rotationSpeed: origin.rotationSpeed,
      speed: origin.speed,
      inertia: origin.inertia,
      imgShip: origin.imgShip,
      player: origin.player,
      id: origin.id,
    });
  }
  export const copyParticles = (that:any, origin: any) => {

    return new ParticleCopy({
      position: origin.position,
      velocity: origin.velocity,
      lifeSpan: origin.lifeSpan,
      size: origin.size,
      inertia: origin.inertia,
      radius: origin.radius,
    });
  }

  export const copyBullets = (that:any, origin: any) => {
    return new BulletCopy({
      position: origin.position,
      velocity: origin.velocity,
      size: origin.size,
      color: origin.color,
      lifeSpan: origin.lifeSpan,
      rotation: origin.rotation,
      radius: origin.radius,
    });
  }


  export const createShip = (that:any, player:any) => {
    let ship = new Ship({
      position: {
        x: that.state.screen.width/2,
        y: that.state.screen.height/2
      },
      //lastShotLimit: 0.1,
      create: that.createObject,
      player,
      onDie: () => {},
      onSound: that.onSound.bind(that),
    });
    that.createObject(ship, 'ships')
  }

export const createObject = (canvasItemsGroups:CanvasItemGroups, item:CanvasItem, group:string = 'asteroids'):void => {
    canvasItemsGroups[group].push(item);
}