import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actionCreators from '../../redux/asteroids/actions'

import KeyHandler, { KEY } from './keys'
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
  generateShield,
  generateAutoShield,
} from './generate'
import BoardInit from './boardInit'
import BoardGameOver from './boardGameOver'
import TextFlasher from './text-flasher'
import GameBoard from './gameboard/main'

import { superNova } from './nova'
import sounds from './sounds'
import GameBorder from './gameBorder'

import type { Ikeys } from './keys'
import type { Iscreen } from './screen-handler'
import type {
  IState,
  CanvasItem,
  Ishield,
  ShipItem,
  PresentItem,
  StarItem,
  CanvasItemGroups,
  Iposition,
  collisionObject,
  IshipWeapon,
  IshipEquipment,
  IgameChanger,
  IspaceInterferer,
  Isound
 } from './game.types'

const mapStateToProps = (state:any) => ({
  gameStatus: state.asteroids.gameStatus,
  level: state.asteroids.level,
  lives: state.asteroids.lives,
  score: state.asteroids.score,
  upgradeFuel: state.asteroids.upgradeFuel,
  shieldFuel: state.asteroids.shieldFuel,
  upgradeFuelTotal: state.asteroids.upgradeFuelTotal,
})
const mapDispatchToProps = (dispatch:any) => ({
  actions: bindActionCreators(actionCreators, dispatch),
})

type IProps = {
  gameStatus: string
  score: number
  actions: {
    [key: string]: any
  }
  level: number,
  lives: number,
  shieldFuel: number,
  upgradeFuel: number,
  upgradeFuelTotal: number,
}

  // Upgrades actions


let classRoot = "";

export class Game extends Component<IProps> {
  canvasRef;
  state:IState;
  canvasItems:CanvasItem[];
  canvasItemsGroups: CanvasItemGroups;
  particles:CanvasItem[];
  fps = 60;
  ctx:any;
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
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      context: null,
      keys : {
        left  : false,
        right : false,
        up    : false,
        down  : false,
        space : false,
        return: false,
        weapon: false,
        escape: false,
      },
      colorThemeIndex: 7,//randomInterger(0, themes.length - 1 ),
      upgradeFuel: 0,
      readyforNextLife: false,
      hasError: false,
      //nextPresentDelay: randomNumBetween(500, 1000),
      nextPresentDelay: randomNumBetween(1, 100),
      ufoDelay: randomNumBetween(1, 100),
      inifityScreen:true,
      inifityFuel: 500,
    }
    this.createObject = this.createObject.bind(this)
  }

  componentDidMount():void {
    if (this.canvasRef.current !== null) {
      const context = this.canvasRef.current!.getContext('2d');
      //this.setState({ context });
      this.ctx = context
    }
    this.update()
  
    this.props.actions.UPDATE_GAME_STATUS('INITIAL')
  }

  componentWillUnmount():void {
    clearAllIntervals()
    this.removeAllCanvasItems()
    this.props.actions.UPDATE_GAME_STATUS('STOPPED')
  }

  componentDidUpdate(prevProps: IProps, prevState:IState):void {
    if (prevProps.gameStatus !== this.props.gameStatus) {
      switch (this.props.gameStatus) {
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
          this.props.actions.UPDATE_GAME_LEVEL(0)
          this.props.actions.UPDATE_UPGRADE_FUEL(0)
          this.props.actions.UPDATE_SHIELD_FUEL(0)
          this.props.actions.UPDATE_LIVES(2)
          generateStars(this)
          this.setState({
            inifityScreen: true,
            inifityFuel: 0,
          })
          createShip(this)
          this.props.actions.UPDATE_GAME_STATUS('GAME_ON')
          break;
        case 'GAME_ABORT':
          removeInterval('abortAfterGameOver')
          this.removeAllCanvasItems()
          this.setState({
            inifityScreen: true,
            inifityFuel: 0,
          })
          this.props.actions.UPDATE_GAME_STATUS('INITIAL')
          break;
        case 'GAME_NEW_LAUNCH':
            createShip(this)
            this.props.actions.UPDATE_SHIELD_FUEL(0)
            this.props.actions.UPDATE_GAME_STATUS('GAME_ON')
          break;
        case 'GAME_RECOVERY':
          this.removeCanvasItems(['ship'])
          addInterval('waitForRecovery', 500, () => {
            removeInterval('waitForRecovery')
            this.props.actions.UPDATE_GAME_STATUS('GAME_GET_READY')
            this.props.actions.UPDATE_SHIELD_FUEL(0)
          })
          break;
        case 'GAME_GET_READY':
          removeInterval('waitForRecovery')
          addInterval('waitForGetReady', 10000, () => {
            
            removeInterval('waitForGetReady')
            this.props.actions.UPDATE_GAME_STATUS('GAME_NEW_LAUNCH')
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
            this.props.actions.UPDATE_GAME_STATUS('GAME_ABORT')
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

  addScore(points:number) {
    this.props.actions.ADD_SCORE(points)
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

  collisionWithPresent(ship:ShipItem, present:PresentItem):void {
    const upgrade: IshipWeapon | IshipEquipment | IgameChanger | IspaceInterferer = present.getUpgrade();
    // Extralife
    switch(upgrade.type) {
      case 'extraLife':
        this.props.actions.UPDATE_LIVES('+1')      
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
      case 'shield': 
        generateShield(this)
      break;
      case 'autoShield': 
        generateAutoShield(this)
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
    present.destroy(ship.type);
}

levelUp() {
  const amountOfAsteroids = Math.floor(Number(this.props.level) + 1)
  const nextSelectedColor = randomInterger(0, themes.length - 1 )
  this.props.actions.UPDATE_COLOR_THEME(nextSelectedColor)
  this.setState({
    colorThemeIndex: nextSelectedColor,
    nextPresentDelay: randomNumBetween(400, 1000)
  })
  generateAsteroids(this, amountOfAsteroids)
  this.props.actions.ADD_SCORE(1000)
  this.props.actions.UPDATE_GAME_STATUS('GAME_ON')
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
        cb: (item1:CanvasItem, item2:CanvasItem):void => {
          item1.destroy(item2.type);
          item2.destroy(item1.type);
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
        cb: (item1:Ishield, item2:CanvasItem):void => {
          if (item1.isActive) {
            item2.destroy(item1.type);
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
        cb: (item1:CanvasItem, item2:CanvasItem):void => {

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
          if (this.props.lives < 1) {
            this.props.actions.UPDATE_GAME_STATUS('GAME_OVER')
          } else {
            this.props.actions.UPDATE_LIVES('-1')
            this.props.actions.UPDATE_GAME_STATUS('GAME_RECOVERY')
          }
        }
      },   
    ]
    await collisionBetweens(this.canvasItemsGroups, collisions)

    await collisionBetween(
      this.canvasItemsGroups,
      'lazar',
      [ 'asteroid', 'ufo'],
      (item1:CanvasItem, item2:CanvasItem):void => {
        item1.destroy(item2.type);
        item2.destroy(item1.type);
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
    const ufolimit = this.props.level - 1 

    if (this.state.ufoDelay-- < 0){
      if (this.props.level > -1 && this.canvasItemsGroups['ufos'].length < ufolimit) {
        createUfo(this) 
      }
      this.state.ufoDelay = randomNumBetween(400, 1000)
    }

    // Instant Key handling
    if (this.props.gameStatus === 'INITIAL' && state.keys.space) {
      this.props.actions.UPDATE_GAME_STATUS('GAME_START')
    }
    if ((this.props.gameStatus === 'GAME_ON' || this.props.gameStatus === 'GAME_OVER') && state.keys.escape) {
      this.props.actions.UPDATE_GAME_STATUS('GAME_ABORT')
    }
    if (this.props.gameStatus === 'GAME_GET_READY' && state.keys.space) {
      this.props.actions.UPDATE_GAME_STATUS('GAME_NEW_LAUNCH')
    }


    if (!this.canvasItemsGroups['asteroids'].length && this.props.gameStatus === 'GAME_ON') {
      this.props.actions.UPDATE_GAME_LEVEL('+1')
      this.props.actions.UPDATE_GAME_STATUS('GAME_LEVEL_UP')
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
      <React.Fragment>
        <ScreenHandler
          cb={
            (screen:Iscreen) => {
              this.removeCanvasItems(['star'])
              generateStars(this)
              this.setState({screen})
            }
          } />
        <KeyHandler keys={this.state.keys} cb={(keys:Ikeys) => this.setState({keys})}/>
        <BoardInit gameStatus={this.props.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <BoardGameOver gameStatus={this.props.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <TextFlasher allowedStatus={['GAME_GET_READY', 'GAME_RECOVERY']} text={`PRESS ENTER TO LAUNCH NEW SHIP`} gameStatus={this.props.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <TextFlasher allowedStatus={['GAME_LEVEL_UP']} text={`LEVEL UP`} gameStatus={this.props.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <GameBoard
          gameStatus={this.props.gameStatus}
          score={this.props.score}
          colorThemeIndex={this.state.colorThemeIndex}
          lives={this.props.lives}
          level={this.props.level}
          shieldFuel={this.props.shieldFuel}
          upgradeFuel={this.props.upgradeFuel}
          upgradeFuelTotal={this.props.upgradeFuelTotal}
        />
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



      </React.Fragment>
    )
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Game)