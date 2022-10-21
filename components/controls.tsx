import React, { useState, useEffect } from 'react'

import GameHost from '../components/asteroids/game-host'
import GameVisitor from '../components/asteroids/game-visitor'
import { Ikeys, iPlayer } from './asteroids/game.types'
import KeyHandler from './asteroids/keys'

interface iProps {
  userType: 'HOST' | 'VISITOR'
  gameCode: string,
  sendData:Function,
  receiveData: any,
}

export const Controls = (props: iProps) => {

  // Configure multiplayer

  const [keys, setKeys] = useState({
    left  : false,
    right : false,
    up    : false,
    down  : false,
    space : false,
    return: false,
    weapon: false,
    escape: false,
  } as Ikeys)

  const [players, setPlayers] = useState([] as iPlayer[])

  const createPlayer = ():void => {
    setPlayers(prev => [...prev, {
      id: 'abc123',
      name: 'visitor',
      isHost: true,
      keys,
      score: 0,
      lives: 3,
    }])
  }

  useEffect(() => {
    //createPlayer()
    /*
    props.sendData({
      id: 'visitor',
      name: 'visitor',
      isHost: true,
      keys,
      score: 0,
      lives: 3,
    })
    */
  },[])

  useEffect(() => {
    createPlayer()
  },[keys])

  return (
    <>
      <KeyHandler keys={keys} cb={(keys:Ikeys) => setKeys(keys)} />
      {
        props.userType === 'HOST' ? (
          <GameHost
          receiveData={props.receiveData}
          sendData={props.sendData}
          gameCode={props.gameCode}
          players={players}
        />          
        ) : (
          <GameVisitor
          receiveData={props.receiveData}
          sendData={props.sendData}
          gameCode={props.gameCode}
          players={players}
        />
        )
      }
    </>
  )
}


export default Controls