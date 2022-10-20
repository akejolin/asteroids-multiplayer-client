import type {soundArrObject} from './game.types'

import UIfx from '../utils/uifx'


const SNOWPACK_PUBLIC_PUBLIC_URL = '//static.akejolin.se/asteroids'


export default {
  asteroidHit: new UIfx(
     // soundAsteroidHit
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/asteroid-hit.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  crash: new UIfx(
    //soundCrash,
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/crash.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  background: new UIfx(
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/background.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
} as soundArrObject