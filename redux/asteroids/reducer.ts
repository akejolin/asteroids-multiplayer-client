import { createReducer } from '@reduxjs/toolkit';
import * as actions from './actions';

import { randomInterger } from '../../components/asteroids/helpers'
import { themes } from '../../components/asteroids/color-theme'

type iInitState = {
  gameStatus: string,
  score: number,
  lives: number,
  level: number,
  numAsteroids: number,
  shield: boolean,
  shieldFuel: number,
  upgradeFuel: number,
  upgradeFuelTotal: number,
  selectedColorTheme: number,
}

const initialState = {
  gameStatus: 'MOUNTING',
  score: 0,
  lives: 3,
  level: 0,
  numAsteroids: 3,
  shield: false,
  shieldFuel: 0,
  upgradeFuel: 0,
  upgradeFuelTotal: 0,
  selectedColorTheme: randomInterger(0, themes.length - 1 ),
}

export const reducer = createReducer(initialState, builder => {
  builder
  /*
    .addCase(increment, state => {
      state.value++;
    })
    .addCase(decrement, state => {
      state.value--;
    })
  */
    .addCase(actions.UPDATE_GAME_STATUS, (state, action) => {
      state.gameStatus = action.payload;
    })
    .addCase(actions.UPDATE_GAME_LEVEL, (state, action) => {
      const payload = action.payload
      let level = 0
      if (String(payload).indexOf('+') < 0 && String(payload).indexOf('-') < 0) {
        level = Number(payload)
      } else {
        level = Math.ceil(Number(state.level) + Number(payload))
      }
      state.level = level;
    })
    .addCase(actions.UPDATE_SHIELD_FUEL, (state, action) => {
      state.shieldFuel = action.payload;
    })
    .addCase(actions.UPDATE_UPGRADE_FUEL, (state, action) => {
      const payload = action.payload
      state.upgradeFuel = Number(payload.data),
      state.upgradeFuelTotal = Number(payload.total)
    })
    .addCase(actions.UPDATE_LIVES, (state, action) => {
      const payload = action.payload
      let lives = 0
      if (String(payload).indexOf('+') < 0 && String(payload).indexOf('-') < 0) {
        lives = Number(payload)
      } else {
        lives = Math.ceil(Number(state.lives) + Number(payload))
      }
      state.lives = lives < 0 ? 0 : lives;
    })
    .addCase(actions.ADD_SCORE, (state, action) => {
      state.score += action.payload;
    })
    .addCase(actions.RESET_SCORE, (state, action) => {
      state.score = 0;
    })
    .addCase(actions.UPDATE_COLOR_THEME, (state, action) => {
      state.selectedColorTheme = action.payload;
    })
});