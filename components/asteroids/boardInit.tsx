import React, { useState, useEffect } from 'react'
import FlexView from '../flexView'
import {iPlayer} from './game.types'

type ComponentProps = {
  gameStatus: string,
  colorThemeIndex: number,
  players: iPlayer[]
}


export const InitBoard = (props: ComponentProps) => {
  const [highscoreDisplayed, setHighscoreDisplayed] = useState(false)
  
  useEffect(() => {
    console.log('props.players: ', props.players)
  }, [props.players])  


  if (props.gameStatus !== "INITIAL") {
    return null
  }



  const styles = {
    infoBtn: {
      fontSize: 10,
      border: '1px solid #fff',
      borderRadius: 8,
      padding: '15px 9px 9px 9px',
    }
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
        {!highscoreDisplayed && (
          <React.Fragment>
            <h1>Welcome to play!</h1>
            <FlexView style={{flexGrow: 0, marginTop: 20, height: 'unset'}}>
              <FlexView row>
                <div style={{marginRight: 12, whiteSpace: 'nowrap'}}>
                  <span style={styles.infoBtn}>
                  Left
                  </span>
                </div>
                <div style={{marginRight: 12, whiteSpace: 'nowrap', marginBottom:20}}>
                  <span style={styles.infoBtn}>
                  Up
                  </span>
                </div>
                <div style={{whiteSpace: 'nowrap'}}>
                  <span style={styles.infoBtn}>
                  Right
                  </span>
                </div>
              </FlexView>
              <FlexView row>
                <div style={{whiteSpace: 'nowrap'}}>
                  <span style={styles.infoBtn}>
                    Space
                  </span> = Fire
                </div>
                <div style={{marginLeft: 20, whiteSpace: 'nowrap'}}>
                  <span style={styles.infoBtn}>
                    F
                  </span> = Shield
                </div>
                <div style={{marginLeft: 20, whiteSpace: 'nowrap'}}>
                  <span style={styles.infoBtn}>
                    Escape
                  </span> = Quit
                </div>
              </FlexView>
              <FlexView row>
                {
                  props.players.map(item => (
                    <div>
                      {item.name}
                    </div>
                  ))
                }
              </FlexView>
            </FlexView>
          </React.Fragment>
        )}
      </FlexView>
    </div>
  )
}
InitBoard.defaultProps = {
  players: []
}

export default InitBoard