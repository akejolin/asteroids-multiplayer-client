import { createReducer } from '@reduxjs/toolkit';
import {
  decrement,
  increment,
  incrementByAmount,
} from './actions';

type iInitState = {
  value: number;
};

const initialState: iInitState = {
  value: 0,
};

export const reducer = createReducer(initialState, builder => {
  builder
    .addCase(increment, state => {
      state.value++;
    })
    .addCase(decrement, state => {
      state.value--;
    })
    .addCase(incrementByAmount, (state, action) => {
      state.value += action.payload;
    });
});