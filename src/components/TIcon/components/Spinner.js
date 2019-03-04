/* eslint-disable max-len */
import React from 'react'

const ROUND_DEG = 360
const r = 8
const dur = 1
const count = 8
const viewBoxSize = 120
const minOpacity = 0.1
const maxOpacity = 1
const minScale = 1
const maxScale = 1.5

const defaultAnimationProps = i => ({
  begin: `${dur / count * i}s`,
  dur: `${dur}s`,
  repeatCount: 'indefinite',
  restart: 'always',
})

const Spiner = ({
  animationStop,
}) => (
  <svg {...{
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: `0 0 ${viewBoxSize} ${viewBoxSize}`,
  }}>
    <g {...{
      transform: `translate(${viewBoxSize / 2} ${viewBoxSize / 2})`,
    }}>
      {
        (new Array(count)).fill(0).map((_, i) => (
          <g {...{
            key: i,
            transform: `rotate(${ROUND_DEG / count * i}) translate(${(viewBoxSize / 2) - (r * maxScale)} 0)`,
          }}>
            <circle {...{
              r,
              style: {
                opacity: (maxOpacity - minOpacity) / (count - 1) * i,
                transform: minScale + ((maxScale - minScale) / (count - 1) * i),
              },
            }}>
              {
                !animationStop &&
                <animate {...{
                  attributeName: 'opacity',
                  from: maxOpacity,
                  to: minOpacity,
                  ...defaultAnimationProps(i),
                }} />
              }
              {
                !animationStop &&
                <animateTransform {...{
                  attributeName: 'transform',
                  type: 'scale',
                  from: maxScale,
                  to: minScale,
                  ...defaultAnimationProps(i),
                }} />
              }
            </circle>
          </g>
        ))
      }
    </g>
  </svg>
)

export default Spiner
