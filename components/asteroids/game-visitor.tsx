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
  }

  componentWillUnmount():void {
    clearAllIntervals()
    this.removeAllCanvasItems()
    //this.setState({gameStatus: 'STOPPED'})
  }

  actOnRemoteAction() {
    const payload = this.props.receiveData
    switch (payload.action) {
      case 'stateSync':
        this.setState(payload.data)
        this.update();
      break;
      case 'gameStatus':
        this.setState({gameStatus: `${payload.data}`})
      break;
      case 'canvasItemsGroupsSync':
      this.canvasItemsGroups = payload.data
      this.update();
      break;
    }
  }

  componentDidUpdate(prevProps: IProps, prevState:IState):void {

    if (prevProps.receiveData !== this.props.receiveData) {
      this.actOnRemoteAction()
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
          this.onSound({file: 'background',status: 'PLAYING'})
          break;
        case 'GAME_START':
          clearAllIntervals()
          this.removeAllCanvasItems()    
          break;
        case 'GAME_ABORT':
          this.removeAllCanvasItems()
          //this.setState({gameStatus: 'INITIAL'})
          break;
        case 'GAME_NEW_LAUNCH':
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
    //this.setState({gameStatus: 'GAME_ON'})
  }

  async update():Promise<void> {
    
    console.log('Update: ', this.canvasItemsGroups)

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

    await updateObjects(this.canvasItemsGroups, this.state, this.ctx)
    
    context.restore();
  
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

        <div style={{zIndex: 100, position: "absolute"}}>Visiting game: {this.gameCode}</div>
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