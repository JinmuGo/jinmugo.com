// 꽃잎 색은 favicon과 같은 주황 그라데이션이다. id는 페이지에서 겹치지 않게 logo- 접두사를 쓴다.
const PETALS = [
  {
    d: "M275.14,82.84s25.07-27.13-1.53-60-61.57-7.83-61.57-7.83c0,0-12.52-17.22-31.97-10.43s-18.64,24.52-18.64,24.52c-25.04,14.09-33.39,42.78-27.65,53.74s32.87,76.86,32.87,76.86c0,0,17.18,43.04,47.44,12.08,30.26-30.96,61.05-88.94,61.05-88.94Z",
    gradient: { x1: 192.5, y1: 176.5, x2: 189, y2: -9.5 },
    stops: [
      { offset: 0, color: "#FFF585" },
      { offset: 0.465, color: "#FF8C67" },
      { offset: 1, color: "#FF8C67" },
    ],
  },
  {
    d: "M240.48,206.76c29.8-3.38,34.7,13.57,62.35,14.09s29.74-26.61,29.74-26.61c0,0,29.74,2.61,37.04-22.17s-15.91-38.61-15.91-38.61c.52-9.91-3.39-24.78-3.39-24.78,0,0-9.65-25.57-39.91-32.35s-48,18.26-48,18.26c-14.87-1.83-23.22,1.3-23.22,1.3-30.78,9.39-41.99,79.88-41.99,79.88,0,0-7.53,36.75,43.3,30.99Z",
    gradient: { x1: 185, y1: 152.5, x2: 367.762, y2: 126.877 },
    stops: [
      { offset: 0.0211729, color: "#FFF585" },
      { offset: 0.402742, color: "#FF9D70" },
      { offset: 1, color: "#FF9D70" },
    ],
  },
  {
    d: "M195.7,338.5c9.75,0,19.99,7.3,25.73,7.3s24.52-10.96,41.74-61.04-15.13-71.48-15.13-71.48c0,0-25.57-18.78-51.65-14.09s-36.52,14.09-57.91,40.7-14.09,56.87-14.09,56.87c0,0,20.35,54.78,47.48,46.43s23.84-4.7,23.84-4.7Z",
    gradient: { x1: 195.704, y1: 198.438, x2: 195.704, y2: 345.8 },
    stops: [
      { offset: 0, color: "#FFF585" },
      { offset: 0.41, color: "#FFB17A" },
      { offset: 1, color: "#FFB17A" },
    ],
  },
  {
    d: "M171.33,207.64s4.71-24.84-29.2-27.86c-21.42-1.91-42.85-5.17-64.23-.86-27.04,5.45-50.4,19.39-61.67,45.08-8.68,19.77-21.21,54.2,2.77,68.58,0,0,8.35,4.17,16.7,0,0,0,42.95,48.92,88.01-17.24,0,0,41.38-49.24,47.62-67.71Z",
    gradient: { x1: 162.5, y1: 177, x2: 24.5, y2: 283.5 },
    stops: [
      { offset: 0, color: "#FFF585" },
      { offset: 0.475, color: "#FDC88E" },
      { offset: 1, color: "#FFC585" },
    ],
  },
  {
    d: "M136.87,89.36s-31.26-26.86-51.61-19.56-19.83,25.04-19.83,25.04c0,0-46.43-27.13-60.52,27.13s54.26,62.09,54.26,62.09c0,0,94.74,18.54,119.44,7.83,24.7-10.71-41.74-102.53-41.74-102.53Z",
    gradient: { x1: 171.034, y1: 178.748, x2: 20.4661, y2: 92.2518 },
    stops: [
      { offset: 0, color: "#FFF585" },
      { offset: 0.5, color: "#F8C885" },
      { offset: 1, color: "#F8C885" },
    ],
  },
]

const STROKE = { stroke: "#231815", strokeWidth: 6, strokeMiterlimit: 10 }

export default function Logo() {
  return (
    <svg viewBox="0 0 375 349" className="h-9 w-auto" role="img" aria-label="Jinmu">
      <title>Jinmu</title>
      <defs>
        {PETALS.map(({ gradient, stops }, index) => (
          <linearGradient
            key={gradient.x1}
            id={`logo-petal-${index}`}
            gradientUnits="userSpaceOnUse"
            {...gradient}
          >
            {stops.map(({ offset, color }) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        ))}
      </defs>
      <g {...STROKE} strokeLinecap="round" strokeLinejoin="round">
        {PETALS.map(({ d }, index) => (
          <path key={d.slice(0, 16)} d={d} fill={`url(#logo-petal-${index})`} />
        ))}
      </g>
      <g fill="#FFD166" {...STROKE}>
        <ellipse cx="125.23" cy="118.67" rx="6.47" ry="10.78" />
        <ellipse
          cx="99.13"
          cy="127.56"
          rx="6.47"
          ry="10.78"
          transform="translate(-62.35 132.37) rotate(-53.85)"
        />
        <ellipse
          cx="99.13"
          cy="151.47"
          rx="6.47"
          ry="10.78"
          transform="translate(-64.92 228.01) rotate(-81.81)"
        />
      </g>
      <g fill="#AED9B0" {...STROKE}>
        <path d="M126.24,140.79v11.44s46.12,18.28,47.07,52.18l37.62-10.77s-31.9-39.27-84.69-52.85Z" />
        <path d="M123.89,151.24s42,15.89,49.57,51.89" />
        <path d="M126.24,140.79s64.96,23.22,83.74,50.87" />
      </g>
    </svg>
  )
}
