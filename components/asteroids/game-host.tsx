import React, { Component } from 'react'

import ScreenHandler from './screen-handler'
import { randomInterger, randomNumBetween} from './helpers'
import {
  addInterval,
  removeInterval,
  clearAllIntervals,
} from './gameIntervalHandler'
import { themes } from './color-theme'
import {
  updateObjects,
  collisionBetweens,
} from './processer'
import {
  generateAsteroids,
  generateStars,
  createShip,
} from './generate'
import BoardInit from './boardInit'
import TextFlasher from './text-flasher'
import sounds from './sounds'

import type {
  IState,
  CanvasItem,
  CanvasItemGroups,
  collisionObject,
  Isound,
  iPlayer,
  Iscreen,
 } from './game.types'


interface IProps {
  players: iPlayer[],
  gameCode: string,
  receiveData: any,
  sendData: Function,
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
  gameCode: string;
  
  constructor(props:IProps) {
    super(props);
    this.gameCode = props.gameCode;
    this.canvasRef = React.createRef<HTMLCanvasElement>();
    this.canvasItems = []
    this.canvasItemsGroups = {
      asteroids: [],
      particles: [],
      ships: [],
      bullets: [],
      stars: []
    }

    this.particles = []
    this.state = {
      gameStatus: 'START_UP',
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      level: 0,
      context: null,
      colorThemeIndex: 0

    }
    this.createObject = this.createObject.bind(this)
    this.players = []
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
    })
  }

  actOnRemoteAction(payload:any) {
    switch (payload.action) {
      case 'whatever':
        
      break;
    }
  }

  componentWillUnmount():void {
    clearAllIntervals()
    this.removeAllCanvasItems()
    this.setState({gameStatus: 'STOPPED'})
  }

  componentDidUpdate(prevProps: IProps, prevState:IState):void {

    if (prevState !== this.state) {
      this.props.sendData({
        action: 'stateSync',
        data: this.state,
      })      
    }

    if (prevProps.receiveData !== this.props.receiveData) {
      this.actOnRemoteAction(this.props.receiveData)
    }

    if (prevProps.players !== this.props.players) {
      this.players = this.props.players
    }
    if (prevState.gameStatus !== this.state.gameStatus) {

      switch (this.state.gameStatus) {
        case 'INITIAL':
          generateAsteroids(this, 3)
          generateStars(this)
          break;
        case 'GAME_ON':
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
            level: 0,
            gameStatus: 'GAME_ON'
          })
          this.props.players.forEach((item:iPlayer) => {
            item.lives = 3,
            item.score = 0,
            createShip(this, item)
          })
          
          break;
        case 'GAME_ABORT':
          this.removeAllCanvasItems()
          this.setState({
            gameStatus: 'INITIAL'
          })
          break;
        case 'GAME_NEW_LAUNCH':
            this.props.players.forEach((item:iPlayer) => {
              createShip(this, item)
            })
            this.setState({gameStatus: 'GAME_ON'})
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

  levelUp() {
    const amountOfAsteroids = Math.floor(Number(this.state.level) + 1)
    const nextSelectedColor = randomInterger(0, themes.length - 1 )
    this.setState({
      colorThemeIndex: nextSelectedColor,
      nextPresentDelay: randomNumBetween(400, 1000)
    })
    generateAsteroids(this, amountOfAsteroids)
    
    // Todo: add score to all players
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


    const collisions:collisionObject[] = [
      {
        primary: 'bullet',
        secondary: [ 'asteroid'],
        cb: (item1:any, item2:any):void => {
          item1.destroy(item2.type, item2.originId);
          item2.destroy(item1.type, item1.originId);
        }
      },
      {
        primary: 'ship',
        secondary: [ 'asteroid'],
        cb: (item1:any, item2:CanvasItem):void => {
          item1.destroy(item2.type);
          item2.destroy(item1.type);

          const target = this.players.find(item => item.id === item1.player.id)
          if (target) {
            target.lives = target.lives -= 1
            target.lives > 0 ? createShip(this, target) : null
          }

          if (!this.players.find(item => item.lives > 0)) {
            this.setState({gameStatus: 'GAME_OVER'})
          }
        }
      },   
    ]
    await collisionBetweens(this.canvasItemsGroups, collisions)

    // Instant Key handling
    const hostPlayer = this.players.filter(player => player.isHost === true)[0]
    

    if (this.state.gameStatus === 'INITIAL' && hostPlayer && hostPlayer.keys.space) {
      this.setState({gameStatus: 'GAME_START'})
    }
    if (this.state.gameStatus === 'GAME_ABORT' && hostPlayer && hostPlayer.keys.space) {
      this.setState({gameStatus: 'INITIAL'})
    }
    if ((this.state.gameStatus === 'GAME_ON' || this.state.gameStatus === 'GAME_OVER') && hostPlayer && hostPlayer.keys.escape) {
      this.setState({gameStatus: 'GAME_ABORT'})
    }


    if (!this.canvasItemsGroups['asteroids'].length && this.state.gameStatus === 'GAME_ON') {
      this.setState((prev:IState) => ({
        level: prev.level + 1,
        gameStatus: 'GAME_LEVEL_UP'
      }))
    }

    await updateObjects(this.canvasItemsGroups, this.state, this.ctx)

    context.restore();

    this.props.sendData({
      action: 'canvasItemsGroupsSync',
      data: this.canvasItemsGroups,
    })


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
        
        <BoardInit gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} players={this.players} />
        <TextFlasher allowedStatus={['GAME_GET_READY', 'GAME_RECOVERY']} text={`PRESS ENTER TO LAUNCH NEW SHIP`} gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <TextFlasher allowedStatus={['GAME_OVER']} text={`GAME OVER`} gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <TextFlasher allowedStatus={['GAME_LEVEL_UP']} text={`LEVEL UP`} gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />

        <div style={{zIndex: 100, position: "absolute"}}>You are hosting the game: {this.gameCode}</div>
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