import React from 'react'
import style from '../index.module.css'


const Circle = ({
  size = 32,
  progress,
}) => {
  const circleRadius = size / 2.5
  let circleLength = Math.PI * circleRadius * 2
  let circleDashOffset = circleLength * (100 - progress) / 100

  return (
    <svg className={style.circle} viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle {...{
        className: style.circleNotLoaded,
        r: circleRadius,
        cx: size / 2,
        cy: size / 2,
        fill: 'transparent',
        strokeDasharray: circleLength,
        strokeDashoffset: 0,
      }} />
      <circle {...{
        className: style.circleLoaded,
        r: circleRadius,
        cx: size / 2,
        cy: size / 2,
        fill: 'transparent',
        strokeDasharray: circleLength,
        strokeDashoffset: Number.isNaN(circleDashOffset) ? `${circleLength}px` : `${circleDashOffset}px`,
      }} />
    </svg>
  )
}

export default Circle
