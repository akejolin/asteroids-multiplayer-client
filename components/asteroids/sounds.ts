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
  enemyShot: new UIfx(
    //soundEnemyShot,
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/enemy-shot.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  enemyShowUp: new UIfx(
    //soundEnemyShowUp,
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/enemy-alert.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  nova: new UIfx(
    //soundNova,
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/nova.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  shieldUp: new UIfx(
    //soundShieldUp,
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/shield-up.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  upgradeCatch: new UIfx(
    //soundUpgradeCatch,
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/upgrade-catch.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  upgradeShowUp: new UIfx(
    //soundUpgradeShowUp,
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/upgrade-show-up.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  klink: new UIfx(
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/klink.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  autoShieldActive: new UIfx(
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/auto-shield-active.mp3`,
    {
      volume: 1.0,
      throttleMs: 100
    }
  ),
  speedShot: new UIfx(
    `${SNOWPACK_PUBLIC_PUBLIC_URL}/sounds/speed-shot.mp3`,
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