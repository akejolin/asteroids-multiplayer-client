import { useEffect } from 'react'
import { Ikeys } from './game.types'

export enum KEY {
    LEFT = 37,
    RIGHT = 39,
    UP = 38,
    DOWN = 40,
    A = 65,
    D = 68,
    W = 87,
    SPACE = 32,
    RETURN = 13,
    WEAPON = 70,
    ESCAPE = 27,
}

type IProps = {
    cb:Function,
    keys: Ikeys,
  }

export const Keys = ({keys, cb=()=>{}}:IProps) => {
    const handleKeys = (value: boolean ) => (e: KeyboardEvent): void => {
        if (e.keyCode === KEY.ESCAPE) keys.escape = value;
        if (e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) keys.left  = value;
        if (e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) keys.right = value;
        if (e.keyCode === KEY.UP     || e.keyCode === KEY.W) keys.up    = value;
        if (e.keyCode === KEY.DOWN) keys.down = value;
        if (e.keyCode === KEY.SPACE) keys.space = value;
        if (e.keyCode === KEY.RETURN) keys.return = value;
        if (e.keyCode === KEY.WEAPON) keys.weapon = value;
        //dispatch(update(keys))
        cb(keys)
    }
    useEffect(() => {
        window.addEventListener('keyup', handleKeys(false));
        window.addEventListener('keydown', handleKeys(true));
      }, [])
    return null
}

export default Keys