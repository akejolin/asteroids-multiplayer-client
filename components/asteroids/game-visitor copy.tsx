import React, { Component } from 'react'

import ScreenHandler from './screen-handler'
import { randomInterger, randomNumBetween} from './helpers'
import {
  clearAllIntervals,
} from './gameIntervalHandler'
import { themes } from './color-theme'
import {
  updateObjects,
} from './processer'
import {
  generateStars,
  copyAsteroids,
  generateAsteroids
} from './generate'
import BoardInit from './boardInit'
import TextFlasher from './text-flasher'
import sounds from './sounds'

import type {
  IState,
  CanvasItem,
  CanvasItemGroups,
  Isound,
  iPlayer,
  Iscreen,
 } from './game.types'


interface IProps {
  players: iPlayer[],
  gameCode: string,
  receiveData: any,
  sendData: Function,
  remoteConnection:any,
  localConnection:any
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
  video;
  
  constructor(props:IProps) {
    super(props);
    this.gameCode = props.gameCode;
    this.canvasRef = React.createRef<HTMLCanvasElement>();
    this.video = React.createRef<HTMLVideoElement>();
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

    if (this.video.current !== null) {
      const video = this.video.current

      console.log('componentDidMount : this.props.remoteConnection: ', this.props.remoteConnection)
      this.props.remoteConnection.ontrack = (e:any) => {
        console.log('Got some some track')
        video.srcObject = e.streams[0];
        return false
      }




      this.video.current.addEventListener('loadedmetadata', function() {

      });
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
        this.setState({
          gameStatus: payload.data.gameStatus,
          level: payload.data.level,
          colorThemeIndex: payload.data.colorThemeIndex
        })
      break;
      case 'syncContext':
        //this.setState({context: payload.data});
          
          this.ctx.drawImage(payload.data, 0, 0);
        
      break;

      case 'gameStatus':
        this.setState({gameStatus: `${payload.data}`})
      break;

      case 'syncAsteroids':
        
        //this.canvasItemsGroups.asteroids = payload.data
        
        
        this.canvasItemsGroups.asteroids = []
        payload.data.forEach((element:any) => {
          const item:any = copyAsteroids(this, element)
          this.createObject(item, 'asteroids');
        });
        
        
        //this.canvasItemsGroups.asteroids = payload.data
        //copyAsteroids(this, 3, element)
        //this.update();

      case 'canvasItemsGroupsSync':
      //this.canvasItemsGroups = payload.data
      //this.update();
      break;
    }
  }
  addScore(points:number, originId = 'undefined') {}
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
          generateStars(this)
          //generateAsteroids(this, 3)
          
          break;
        case 'GAME_ON':
  
          //generateAsteroids(this, 3)
          //this.onSound({file: 'background',status: 'PLAYING'})
          break;
        case 'GAME_START':   
          break;
        case 'GAME_ABORT':
          break;
        case 'GAME_NEW_LAUNCH':
          break;
        case 'GAME_LEVEL_UP':

          break;
        case 'GAME_OVER':
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
    

    await updateObjects(this.canvasItemsGroups, this.state, this.ctx)
    context.restore();
    }

  }

  

  render() {
    console.log('this.canvasItemsGroups: ', this.canvasItemsGroups)
    const {screen} = this.state

    return (
      <>
        <ScreenHandler
          cb={
            (screen:Iscreen) => {
              //this.removeCanvasItems(['star'])
              this.setState({screen})
            }
          } />
        
        <BoardInit gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} players={this.players} />
        <TextFlasher allowedStatus={['GAME_GET_READY', 'GAME_RECOVERY']} text={`PRESS ENTER TO LAUNCH NEW SHIP`} gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <TextFlasher allowedStatus={['GAME_OVER']} text={`GAME OVER`} gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />
        <TextFlasher allowedStatus={['GAME_LEVEL_UP']} text={`LEVEL UP`} gameStatus={this.state.gameStatus} colorThemeIndex={this.state.colorThemeIndex} />

        <div style={{zIndex: 100, position: "absolute"}}>Visiting game: {this.gameCode}</div>
        <video 
          style={{
            display: 'block',
            backgroundColor: 'green',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: screen.width,
            height: screen.height,
          }}
          ref={this.video} playsInline autoPlay muted></video>
      </>
    )
  }
}
export default Game