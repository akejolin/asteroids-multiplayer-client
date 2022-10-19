import Asteroid from './Asteroid'
import Ship from './Ship'
import Ufo from './Ufo'
import Shield from './shield'
import AutoShield from './shieldAuto'
import Present from './Present'
import Star from './star'
import {randomNumBetweenExcluding, randomInterger, randomNumBetween} from './helpers'
import type {
    IState,
    CanvasItem,
    CanvasItemGroups,
    Iposition,
    collisionObject,
    IshipWeapon,
    IshipEquipment,
    IgameChanger,
    IspaceInterferer,
    StarItem
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
        addScore: that.addScore.bind(that),
        onSound: that.onSound.bind(that),
      });
      that.createObject(asteroid, 'asteroids');
    }
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
      updateUpgradeFuel: (data:any) => {
        return that.props.actions.UPDATE_UPGRADE_FUEL(data)},
      
    });
    that.createObject(ship, 'ships')
  }

  export const createUfo = (that:any) => {

    let ship = that.canvasItemsGroups['ships'].find((i:CanvasItem) => i.type === 'ship');
    if (!ship) {
      return;
    }

    const { screen } = that.state
    let ufo = new Ufo({
      type: 'ufo',
      size: 20,
      // Ufo always takes off out of screen from a random side.
      position: {
        x: randomNumBetweenExcluding(-200, screen.width + 200, 0, screen.width),
        y: randomNumBetweenExcluding(-200, screen.height + 200, 0, screen.height)
      },
      create: that.createObject.bind(that),
      target: ship,
      addScore: that.addScore.bind(that),
      onSound: that.onSound.bind(that),
      onDie: () => {}
    });
    that.createObject(ufo, 'ufos')

  }


export const generatePresent = (that:any) => {
    let ship = that.canvasItemsGroups['ships'].find((item:CanvasItem) => item.type === 'ship' && item.delete === false)
      if (!ship) {
        return;
      }
      let present = new Present({
        size: 20,
        position: {
          x: randomNumBetweenExcluding(0, that.state.screen.width, -100, +100),
          y: randomNumBetweenExcluding(0, that.state.screen.height, -100, +100)
        },
        create: that.createObject,
        addScore: that.addScore.bind(that),
        upgrade: () => {},
        upgradeType: randomInterger(0,7),
        //upgradeType: randomInterger(4,4),
        onSound: that.onSound.bind(that)
      });
      that.createObject(present, 'presents');
  }

export const generateShield = (that:any) => {
    let ship = that.canvasItemsGroups['ships'].find((i:CanvasItem) => i.type === 'ship');
    if (!ship) {
      return;
    }
    that.removeCanvasItems(['shield'])
    let shield = new Shield({
      position: {
        x: randomNumBetweenExcluding(0, that.state.screen.width, -100, +100),
        y: randomNumBetweenExcluding(0, that.state.screen.height, -100, +100)
      },
      create: that.createObject.bind(that),
      ship: ship,
      updateShieldFuel: (data:number) => that.props.actions.UPDATE_SHIELD_FUEL(data),
      onSound: that.onSound.bind(that)
    })
    that.createObject(shield, 'shields');
  }

  export const generateAutoShield = (that:any) => {
    let ship = that.canvasItemsGroups['ships'].find((i:CanvasItem) => i.type === 'ship');
    if (!ship) {
      return;
    }
    that.removeCanvasItems(['shield'])
    let shield = new AutoShield({
      position: {
        x: randomNumBetweenExcluding(0, that.state.screen.width, -100, +100),
        y: randomNumBetweenExcluding(0, that.state.screen.height, -100, +100)
      },
      create: that.createObject.bind(that),
      ship: ship,
      updateShieldFuel: (data:number) => that.props.actions.UPDATE_SHIELD_FUEL(data),
      onSound: that.onSound.bind(that),
      onStopSound: that.onStopSound.bind(that)
    })
    that.createObject(shield, 'shields');
  }

export const createObject = (canvasItemsGroups:CanvasItemGroups, item:CanvasItem, group:string = 'asteroids'):void => {
    canvasItemsGroups[group].push(item);
}