import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'

import ProcentBar from '../procentBar'
import FlexView from '../flexView'
import {themes} from '../asteroids/color-theme'

type ComponentProps = {
  show: boolean,
  inifityFuel:number,
}


export const GameBoarder = (props: ComponentProps) => {

  if (!props.show) {
    return null
  }
  return (
    <div style={{opacity: props.inifityFuel < 0.4 ? Number(props.inifityFuel)/500 : 1}}>
    <div className="game-border" style={{
      width: '100vw',
      height: '100vh',
      zIndex: 200,
      left:0,
      top:0,
      position: 'absolute',
      
    }}>
    </div>

    </div>
  )
}

export default GameBoarder