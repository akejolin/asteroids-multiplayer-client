import React, { useState, useEffect } from 'react'

import Game from '../components/asteroids/game'
import { Ikeys, iPlayer } from './asteroids/game.types'
import KeyHandler from './asteroids/keys'

export const Controls = (props: {gameCode: string}) => {

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
      name: 'Jonas',
      isHost: true,
      keys,
      score: 0,
      lives: 3,
    }])
  }

  useEffect(() => {
    createPlayer()
  },[])

  return (
    <>
      <KeyHandler keys={keys} cb={(keys:Ikeys) => setKeys(keys)} />
      <Game gameCode={props.gameCode} players={players} />
    </>
  )
}


export default Controls