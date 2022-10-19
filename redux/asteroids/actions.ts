import { createAction } from "@reduxjs/toolkit"

export const UPDATE_GAME_STATUS = createAction<string>('UPDATE_GAME_STATUS')
export const UPDATE_GAME_LEVEL = createAction<number>('UPDATE_GAME_LEVEL')
export const UPDATE_SHIELD_FUEL = createAction<number>('UPDATE_SHIELD_FUEL')
export const UPDATE_UPGRADE_FUEL = createAction<{data:number, total:number}>('UPDATE_UPGRADE_FUEL')

export const UPDATE_LIVES = createAction<number>('UPDATE_LIVES')
export const ADD_SCORE = createAction<number>('ADD_SCORE')
export const RESET_SCORE = createAction('RESET_SCORE')
export const UPDATE_COLOR_THEME = createAction<number>('UPDATE_COLOR_THEME')

// examples ----------------------------------------------

export const increment = createAction('counter/increment')
export const decrement = createAction('counter/decrement')
export const incrementByAmount = createAction<number>('counter/incrementByAmount')