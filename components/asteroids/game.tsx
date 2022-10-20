import React, { Component } from 'react'

import ScreenHandler from './screen-handler'
import {randomNumBetweenExcluding, randomInterger, randomNumBetween} from './helpers'
import {
  addInterval,
  removeInterval,
  clearAllIntervals,
} from './gameIntervalHandler'
import { themes } from './color-theme'
import {
  updateObjects,
  RectCircleColliding,
  collisionBetween,
  collisionBetweens,
} from './processer'
import {
  generateAsteroids,
  generateStars,
  createShip,
  createUfo,
  generatePresent,
  generateAutoShield,
} from './generate'
import BoardInit from './boardInit'
import BoardGameOver from './boardGameOver'
import TextFlasher from './text-flasher'


import { superNova } from './nova'
import sounds from './sounds'
import GameBorder from './gameBorder'

import type {
  IState,
  CanvasItem,
  ShipItem,
  PresentItem,
  CanvasItemGroups,
  collisionObject,
  IshipWeapon,
  IshipEquipment,
  IgameChanger,
  IspaceInterferer,
  Isound,
  iPlayer,
  Iscreen,
 } from './game.types'


interface IProps {
  players: iPlayer[],
}

  // Upgrades actions


export class Game extends Component<IProps> {
  canvasRef;
  state: IState;
  canvasItems: CanvasItem[];
  canvasItemsGroups: CanvasItemGroups;
  particles: CanvasItem[];
  fps = 60;
  ctx: any;
  players: iPlayer[];
  
  constructor(props:IProps) {
    super(props);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
    this.canvasItems = []
    this.canvasItemsGroups = {
      asteroids: [],
      particles: [],
      ships: [],
      shields: [],
      bullets: [],
      lazars:[],
      presents: [],
      ufos: [],
      ufoBullets: [],
      others: [],
      stars: []
    }

    this.particles = []
    this.state = {
      gameStatus: 'INITIAL',
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      level: 0,
      context: null,
      colorThemeIndex: randomInterger(0, themes.length - 1 ),
      hasError: false,
      //nextPresentDelay: randomNumBetween(500, 1000),
      nextPresentDelay: randomNumBetween(1, 100),
      ufoDelay: randomNumBetween(1, 100),
      inifityScreen: true,
      inifityFuel: 500,
    }
    this.createObject = this.createObject.bind(this)
    this.players = props.players
  }

  componentDidMount():void {
    if (this.canvasRef.current !== null) {
      const context = this.canvasRef.current!.getContext('2d');
      this.ctx = context
    }
    this.update()
  
    this.setState({gameStatus: 'INITIAL'})
    window.addEventListener('click', () => {
      if (this.state.gameStatus === 'INITIAL') {
        this.setState({gameStatus: 'GAME_START'})
      }
    });
  }

  componentWillUnmount():void {
    clearAllIntervals()
    this.removeAllCanvasItems()
    this.setState({gameStatus: 'STOPPED'})
  }

  componentDidUpdate(prevProps: IProps, prevState:IState):void {
    if (prevProps.players !== this.props.players) {
      this.players = this.props.players
      console.log('updating players. this.players: ', this.players)
    }
    if (prevState.gameStatus !== this.state.gameStatus) {
      switch (this.state.gameStatus) {
        case 'INITIAL':
          generateAsteroids(this, 3)
          generateStars(this)
          break;
        case 'GAME_ON':
          removeInterval('waitForGetReady')
          removeInterval('waitForRecovery')
          clearAllIntervals()
          this.onSound({
            file: 'background',
            status: 'PLAYING'
          })
          break;
        case 'GAME_START':
          clearAllIntervals()
          this.removeAllCanvasItems()
          generateAsteroids(this, 1)
          
          this.setLives(2)

          generateStars(this)
          this.setState({
            inifityScreen: true,
            inifityFuel: 0,
            level: 0,
            gameStatus: 'GAME_ON'
          })
          this.props.players.forEach((item:iPlayer) => {
            createShip(this, item)
          })
          
          break;
        case 'GAME_ABORT':
          removeInterval('abortAfterGameOver')
          this.removeAllCanvasItems()
          this.setState({
            inifityScreen: true,
            inifityFuel: 0,
            gameStatus: 'INITIAL'
          })
          break;
        case 'GAME_NEW_LAUNCH':
            this.props.players.forEach((item:iPlayer) => {
              createShip(this, item)
            })
            this.setState({gameStatus: 'GAME_ON'})
          break;
        case 'GAME_RECOVERY':
          this.removeCanvasItems(['ship'])
          addInterval('waitForRecovery', 500, () => {
            removeInterval('waitForRecovery')
            this.setState({
              gameStatus: 'GAME_GET_READY',
            })
          })
          break;
        case 'GAME_GET_READY':
          removeInterval('waitForRecovery')
          addInterval('waitForGetReady', 10000, () => {
            
            removeInterval('waitForGetReady')
            this.setState({gameStatus: 'GAME_NEW_LAUNCH'})
          })
          break;
        case 'GAME_LEVEL_UP':
          addInterval('waitLevelUp', 1000, () => {
            removeInterval('waitLevelUp')
            this.levelUp()
          })
          break;
        case 'GAME_OVER':
          addInterval('abortAfterGameOver', 4000, () => {
            removeInterval('abortAfterGameOver')
            this.setState({gameStatus: 'GAME_ABORT'})
          })
          break;
      }
    }
  }

  removeCanvasItems(primary:Array<string>) {
    primary.forEach(element => {
      this.canvasItemsGroups[`${element}s`].splice(0, this.canvasItemsGroups[`${element}s`].length)
    });
  }
  removeAllCanvasItems() {
    const targets = this.canvasItemsGroups
    for (let key in targets) {
      targets[key].splice(0,targets[key].length)
    };
  }

  setLives(amount = 0) {
    this.players.forEach((item:iPlayer, i) => {
      this.players[i].lives = amount
    })
  }
  addScore(points:number, originId = 'undefined') {
    
    const target = this.players.find(item => item.id === originId)

    if (!target) {
      console.log('Error: Score was collected but no player could be connected to it.')
      return 
    }

    target.score = target.score += points;
  }

  onSound(data:Isound):void{
    sounds[data.file].play()
  }
  onStopSound(data:Isound):void{
    sounds[data.file].pause()
  }

  createObject(item:CanvasItem, group:string = 'asteroids'):void {
    this.canvasItemsGroups[group].push(item);
  }
  findPlayer(id:string) {
    return this.players.find(item => item.id === id)
  } 

  collisionWithPresent(ship:ShipItem, present:PresentItem):void {
    const upgrade: IshipWeapon | IshipEquipment | IgameChanger | IspaceInterferer = present.getUpgrade();
    // Extralife
    switch(upgrade.type) {
      case 'extraLife':
        const target = this.players.find(item => item.id === ship.player.id)
        target ? target.lives = target.lives += 1 : null    
      break;
      case 'nova':
        const asteroids = this.canvasItemsGroups['asteroids']
        const ufos = this.canvasItemsGroups['ufos']
        const targets = asteroids.concat(ufos)
        this.onSound({
           file: 'nova',
           status: 'PLAYING'
        })
        superNova(targets)

      break;
      case 'autoShield': 
        generateAutoShield(this, ship)
      break;
      case 'noinfinity':
        this.setState({
          inifityScreen:false,
          inifityFuel:500
        })
      break;
      case 'speedShot':
        ship.updateSecondaryWeapon(upgrade)
        break;
      case 'biggerBullets':
      case 'triple':
      case 'lazar':
        ship.newWeapon(upgrade)
      break;
    }
    present.destroy(ship.type, ship.player.id);
}

levelUp() {
  const amountOfAsteroids = Math.floor(Number(this.state.level) + 1)
  const nextSelectedColor = randomInterger(0, themes.length - 1 )
  this.setState({
    colorThemeIndex: nextSelectedColor,
    nextPresentDelay: randomNumBetween(400, 1000)
  })
  generateAsteroids(this, amountOfAsteroids)
  
  // Todo: add score to all players
  // this.props.actions.ADD_SCORE(1000)
  this.setState({gameStatus: 'GAME_ON'})
}

async update():Promise<void> {
    
    const {state} = this
    const {screen} = state
    const context = this.ctx
    if (context) {
      context.save();
      context.scale(screen.ratio, screen.ratio);

      // Motion trail
      context.fillStyle = themes[state.colorThemeIndex].background
      context.globalAlpha = 0.7;
      context.fillRect(0, 0, screen.width, screen.height);
      context.globalAlpha = 1;
    }

    if (!this.state.inifityScreen) {
      if (this.state.inifityFuel < 0) {
        this.setState({inifityScreen:true,inifityFuel:0})
      } else {
        this.setState({inifityFuel: this.state.inifityFuel--})
      }
    }

    if(this.canvasItemsGroups['ships'].length < 1){
      this.removeCanvasItems(['shield'])
    }


    const collisions:collisionObject[] = [
      {
        primary: 'bullet',
        secondary: [ 'asteroid', 'ufo'],
        cb: (item1:any, item2:any):void => {
          item1.destroy(item2.type, item2.originId);
          item2.destroy(item1.type, item1.originId);
        }
      },
      {
        primary: 'ship',
        secondary: [ 'present'],
        cb: this.collisionWithPresent.bind(this),
        inRadarCb: (isInRadar:boolean, item1:CanvasItem, item2:PresentItem):void => {
          if (isInRadar && (item2.isInRadar !== isInRadar)) {
            item2.isInRadar = isInRadar
          } else {
            item2.isInRadar = isInRadar
          }
        }
      },
      {
        primary: 'shield',
        secondary: [ 'asteroid', 'ufo', 'ufoBullet'],
        cb: (item1:any, item2:any):void => {
          if (item1.isActive) {
            item2.destroy(item1.type, item1.originId);
          }
        },
        inRadarCb: (isInRadar:boolean, item1:any, item2:CanvasItem):void => {
          if (item1.type !== 'autoShield') {
            return
          }
          if (isInRadar) {
            item1.addInterferer()
          } else {
            // nothing
          }
        }
      },
      {
        primary: 'ship',
        secondary: [ 'asteroid', 'ufo', 'ufoBullet'],
        cb: (item1:any, item2:CanvasItem):void => {

          const shields = this.canvasItemsGroups['shields']
          let shieldIsActive = false
          shields.forEach((shield:any) => {
            if (shield.isActive) {
              shieldIsActive = true
            }
          });

          if (!shieldIsActive) {
            item1.destroy(item2.type);
          }
          item2.destroy(item1.type);
          if (!this.players.find(item => item.lives > 0)) {
            this.setState({gameStatus: 'GAME_OVER'})
          } else {
            
            const target = this.players.find(item => item.id === item1.player.id)
            target ? target.lives = target.lives -= 1 : null

            this.setState({gameStatus: 'GAME_RECOVERY'})
          }
        }
      },   
    ]
    await collisionBetweens(this.canvasItemsGroups, collisions)

    await collisionBetween(
      this.canvasItemsGroups,
      'lazar',
      [ 'asteroid', 'ufo'],
      (item1:any, item2:any):void => {
        item2.destroy(item1.type, item1.originId);
        item1.destroy(item2.type, item2.originId);
      },
      ()=>{},
      RectCircleColliding,
    )


    // Generate new present
    if (this.state.nextPresentDelay-- < 0){
      this.state.nextPresentDelay = randomNumBetween(400, 1000)
      if (this.canvasItemsGroups['presents'].length < 1) {
        generatePresent(this)
      }
       
    }

    // Generate new ufo
    const ufolimit = this.state.level - 1 

    if (this.state.ufoDelay-- < 0){
      if (this.state.level > -1 && this.canvasItemsGroups['ufos'].length < ufolimit) {
        createUfo(this) 
      }
      this.state.ufoDelay = randomNumBetween(400, 1000)
    }

    // Instant Key handling
    const hostPlayer = this.players.filter(player => player.isHost === true)[0]
    
        

    if (this.state.gameStatus === 'INITIAL' && hostPlayer && hostPlayer.keys.space) {
      this.setState({gameStatus: 'GAME_START'})
    }
    if ((this.state.gameStatus === 'GAME_ON' || this.state.gameStatus === 'GAME_OVER') && hostPlayer && hostPlayer.keys.escape) {
      this.setState({gameStatus: 'GAME_ABORT'})
    }
    if (this.state.gameStatus === 'GAME_GET_READY' && hostPlayer && hostPlayer.keys.space) {
      this.setState({gameStatus: 'GAME_NEW_LAUNCH'})
    }


    if (!this.canvasItemsGroups['asteroids'].length && this.state.gameStatus === 'GAME_ON') {
      this.setState((prev:IState) => ({
        level: prev.level + 1,
        gameStatus: 'GAME_LEVEL_UP'
      }))
    }

    await updateObjects(this.canvasItemsGroups, this.state, this.ctx)

    context.restore();

    // Engine
    if (this.fps !== 60) {
      setTimeout(() => {
        requestAnimationFrame(() => this.update());
      }, 1000 / this.fps);
    } else {
      requestAnimationFrame(() => this.update());
    }
  }

  render() {
 
    const {screen} = this.state

    return (
      <>
        <ScreenHandler
          cb={
            (screen:Iscreen) => {
              this.removeCanvasItems(['star'])
              generateStars(this)
              this.setState({screen})
            }
          } />
        
        <BoardInit gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <BoardGameOver gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <TextFlasher allowedStatus={['GAME_GET_READY', 'GAME_RECOVERY']} text={`PRESS ENTER TO LAUNCH NEW SHIP`} gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <TextFlasher allowedStatus={['GAME_LEVEL_UP']} text={`LEVEL UP`} gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />

        <GameBorder show={!this.state.inifityScreen} inifityFuel={this.state.inifityFuel}/>

        <canvas
            id="canvas-board"
            ref={this.canvasRef}
            style={{
              display: 'block',
              backgroundColor: themes[this.state.colorThemeIndex].background,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              height: '100%',
            }}
            width={screen.width * screen.ratio}
            height={screen.height * screen.ratio}
          />
      </>
    )
  }
}
export default Game