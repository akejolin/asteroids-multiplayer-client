import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';

import {reducer as asteroids} from './asteroids/reducer';

export const store = configureStore({
  reducer: {
    asteroids,
// This is where we add reducers.
// Since we don't have any yet, leave this empty
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
   ReturnType,
   RootState,
   unknown,
   Action<string>
 >;