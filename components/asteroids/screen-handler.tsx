import React, { useEffect } from 'react'


type IProps = {
  cb:Function,
}


export const ScreenHandler = ({cb=()=>{}}:IProps) => {

    const handle = (e: UIEvent): void => {
      cb({
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      })
    }
    useEffect(() => {
        window.addEventListener('resize',  (e) => handle(e));
        cb({
          width: window.innerWidth,
          height: window.innerHeight,
          // ratio: window.devicePixelRatio || 1,
          ratio: 1,
        })
      }, [])

    return null
}

export default ScreenHandler