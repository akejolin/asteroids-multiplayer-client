import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'

import ProcentBar from '../procentBar'
import FlexView from '../flexView'
import {themes} from '../asteroids/color-theme'

type ComponentProps = {
  gameStatus: string,
  colorThemeIndex: number,
}


/* eslint-disable import/no-anonymous-default-export */
export const GameOverBoard = (props: ComponentProps) => {

  if (props.gameStatus !== "GAME_OVER") {
    return null
  }
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      zIndex: 200,
      position: 'absolute'
    }}>
      <FlexView style={{
        position: 'absolute',
        height: '95%',
        textAlign: 'center',
        lineHeight: '50px',
      }}>
        <FlexView style={{flexGrow: 0, marginTop: 20, height: 'unset'}}>
          <FlexView row>
            <h1 className="blinking-slow">GAME OVER</h1>
          </FlexView>
        </FlexView>
      </FlexView>
    </div>
  )
}
export default GameOverBoard