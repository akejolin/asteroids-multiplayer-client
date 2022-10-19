import React from 'react'
import FlexView from './flexView'

type ComponentProps = {
  style?: any,
  total: number,
  value: number,
  width?: number,
  height?: number,
}
export const NewClass = ({ style={}, total, value, width=80, height=14}:ComponentProps) => {

  if (typeof value === "undefined") {
    value = 0
  }
  let procent = Math.floor((Number(value)/Number(total))*100)
  if (total === 0) {
    procent = 0
  }

  const color = '#fff'

  return (
    <FlexView
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: width-2,
        backgroundColor: 'none',
        height: height-2,
        border: 'solid 1px rgba(255,255,255,.4)'
      }}
    >
      <div
        style={{
          ...{
            height,
            width: `${procent}%`,
            border: 'none',
            margin: 0,
            backgroundColor: color,
          },
          ...style,
        }}
      />
    </FlexView>
  )
}
NewClass.defaultProps = {
  width: 80,
  value: 0,
}

export default NewClass
