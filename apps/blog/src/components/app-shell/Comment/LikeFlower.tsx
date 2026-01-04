import type React from "react"
import { Fragment, useCallback, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useLike } from "@/lib/pocketbase"
import type { MemoMetadata, PostMetadata } from "@/types/content"

// 기본 상수들 (원본 값 그대로 사용)
const STROKE_COLOR = "#231815"
const STROKE_WIDTH = 6
const STROKE_MITERLIMIT = 10
const STROKE_LINECAP = "round"
const STROKE_LINEJOIN = "round"
const FILL_WHITE = "#fff"

interface PetalVariant {
  transition: string
  gradientId: string
}

// 각 꽃잎 variant – 원본 gradient id 사용
const petalVariants: PetalVariant[] = [
  { transition: "opacity 300ms ease-in", gradientId: "paint0_linear" },
  { transition: "opacity 400ms ease-in", gradientId: "paint1_linear" },
  { transition: "opacity 500ms ease-in", gradientId: "paint2_linear" },
  { transition: "opacity 600ms ease-in", gradientId: "paint3_linear" },
  {
    transition: "opacity 700ms ease-in",
    gradientId: "paint4_linear",
  },
]

const maxClicks = petalVariants.length

// 꽃잎의 path 데이터 – 제공해주신 순서대로
const petalPaths = [
  "M275.14,82.84s25.07-27.13-1.53-60-61.57-7.83-61.57-7.83c0,0-12.52-17.22-31.97-10.43s-18.64,24.52-18.64,24.52c-25.04,14.09-33.39,42.78-27.65,53.74s32.87,76.86,32.87,76.86c0,0,17.18,43.04,47.44,12.08,30.26-30.96,61.05-88.94,61.05-88.94Z",
  "M240.48,206.76c29.8-3.38,34.7,13.57,62.35,14.09s29.74-26.61,29.74-26.61c0,0,29.74,2.61,37.04-22.17s-15.91-38.61-15.91-38.61c.52-9.91-3.39-24.78-3.39-24.78,0,0-9.65-25.57-39.91-32.35s-48,18.26-48,18.26c-14.87-1.83-23.22,1.3-23.22,1.3-30.78,9.39-41.99,79.88-41.99,79.88,0,0-7.53,36.75,43.3,30.99Z",
  "M195.7,338.5c9.75,0,19.99,7.3,25.73,7.3s24.52-10.96,41.74-61.04-15.13-71.48-15.13-71.48c0,0-25.57-18.78-51.65-14.09s-36.52,14.09-57.91,40.7-14.09,56.87-14.09,56.87c0,0,20.35,54.78,47.48,46.43s23.84-4.7,23.84-4.7Z",
  "M171.33,207.64s4.71-24.84-29.2-27.86c-21.42-1.91-42.85-5.17-64.23-.86-27.04,5.45-50.4,19.39-61.67,45.08-8.68,19.77-21.21,54.2,2.77,68.58,0,0,8.35,4.17,16.7,0,0,0,42.95,48.92,88.01-17.24,0,0,41.38-49.24,47.62-67.71Z",
  "M136.87,89.36s-31.26-26.86-51.61-19.56-19.83,25.04-19.83,25.04c0,0-46.43-27.13-60.52,27.13s54.26,62.09,54.26,62.09c0,0,94.74,18.54,119.44,7.83,24.7-10.71-41.74-102.53-41.74-102.53Z",
]

const FLOWER_STAMEN_COLOR = "#FFD166"
const FLOWER_CENTER_COLOR = "#AED9B0"

const FlowerSvgHeader = () => (
  <>
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="192.5"
        y1="176.5"
        x2="189"
        y2="-9.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFF585" />
        <stop offset="0.465" stopColor="#FF8C67" />
        <stop offset="1" stopColor="#FF8C67" />
      </linearGradient>
      <linearGradient
        id="paint1_linear"
        x1="185"
        y1="152.5"
        x2="367.762"
        y2="126.877"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.0211729" stopColor="#FFF585" />
        <stop offset="0.402742" stopColor="#FF9D70" />
        <stop offset="1" stopColor="#FF9D70" />
      </linearGradient>
      <linearGradient
        id="paint2_linear"
        x1="195.704"
        y1="198.438"
        x2="195.704"
        y2="345.8"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFF585" />
        <stop offset="0.41" stopColor="#FFB17A" />
        <stop offset="1" stopColor="#FFB17A" />
      </linearGradient>
      <linearGradient
        id="paint3_linear"
        x1="162.5"
        y1="177"
        x2="24.5"
        y2="283.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFF585" />
        <stop offset="0.475" stopColor="#FDC88E" />
        <stop offset="1" stopColor="#FFC585" />
      </linearGradient>
      <linearGradient
        id="paint4_linear"
        x1="171.034"
        y1="178.748"
        x2="20.4661"
        y2="92.2518"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFF585" />
        <stop offset="0.5" stopColor="#F8C885" />
        <stop offset="1" stopColor="#F8C885" />
      </linearGradient>
      <clipPath id="clip0">
        <rect width="374.03" height="348.8" fill="white" />
      </clipPath>
    </defs>
    <style>{`
          @keyframes shakeAndGrow {
            0% { transform: scale(1.05) rotate(5deg); }
            15% { transform: scale(1.15) rotate(7deg); }
            30% { transform: scale(1.2) rotate(3deg); }
            45% { transform: scale(1.15) rotate(8deg); }
            60% { transform: scale(1.15) rotate(2deg); }
            75% { transform: scale(1.1) rotate(5deg); }
            90% { transform: scale(1.1) rotate(3deg); }
            100% { transform: scale(1.05) rotate(5deg); }
          }
        `}</style>
  </>
)

const getPetalDynamicStyle = (index: number, userLikes: number): React.CSSProperties => ({
  opacity: userLikes > index ? 1 : 0,
  transition: petalVariants[index]?.transition,
  fill: `url(#${petalVariants[index]?.gradientId ?? ""})`,
})

const FlowerPetal: React.FC<{
  d: string
  idx: number
  userLikes: number
}> = ({ d, idx, userLikes }) => {
  return (
    <Fragment>
      {/* 아래쪽 white 경로 */}
      <path
        stroke={STROKE_COLOR}
        fill={FILL_WHITE}
        strokeLinecap={STROKE_LINECAP}
        strokeLinejoin={STROKE_LINEJOIN}
        strokeMiterlimit={STROKE_MITERLIMIT}
        strokeWidth={STROKE_WIDTH}
        d={d}
      />
      {/* 위쪽 gradient 경로 (opacity 애니메이션) */}
      <path
        strokeLinecap={STROKE_LINECAP}
        strokeLinejoin={STROKE_LINEJOIN}
        strokeMiterlimit={STROKE_MITERLIMIT}
        strokeWidth={STROKE_WIDTH}
        d={d}
        style={getPetalDynamicStyle(idx, userLikes)}
      />
    </Fragment>
  )
}

interface FlowerProps {
  readonly slug: string
  readonly frontmatter?: PostMetadata | MemoMetadata
  readonly maxLikesPerIP?: number
}

export const Flower: React.FC<FlowerProps> = ({ slug, frontmatter, maxLikesPerIP = 5 }) => {
  const [animationStyle, setAnimationStyle] = useState("")
  const { myLikes, totalLikes, error, isLoading, addLike } = useLike(slug)

  const handleSvgClick = useCallback(async () => {
    if (!frontmatter?.slug || myLikes === -1) {
      return
    }

    // IP별 최대 좋아요 수 제한 확인
    if (myLikes >= maxLikesPerIP) {
      return
    }

    if (myLikes < maxClicks) {
      const success = await addLike()

      if (!success) {
        return
      }

      if (myLikes === maxClicks - 1) {
        setAnimationStyle("shakeAndGrow 1.2s ease-in-out")
      }
    } else {
      setAnimationStyle("shakeAndGrow 1.2s ease-in-out")
    }
  }, [frontmatter, myLikes, maxLikesPerIP, addLike])

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`w-10 h-10 cursor-pointer transition-all hover:scale-105 bg-transparent border-none p-0 ${
              isLoading ? "opacity-50 cursor-wait" : ""
            }`}
            onClick={() => void handleSvgClick()}
            aria-label="Like flower"
            aria-busy={isLoading}
            disabled={isLoading}
          >
            <svg
              viewBox="0 0 375 349"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animation: animationStyle }}
              aria-label="Like flower icon"
            >
              <title>Like flower</title>
              <FlowerSvgHeader />
              <g clipPath="url(#clip0)">
                {petalPaths.map((d, index) => (
                  <FlowerPetal
                    key={`petal-${index}-${d.slice(0, 10)}`}
                    d={d}
                    userLikes={myLikes}
                    idx={index}
                  />
                ))}
                <g>
                  <ellipse
                    fill={FLOWER_STAMEN_COLOR}
                    stroke={STROKE_COLOR}
                    strokeMiterlimit={STROKE_MITERLIMIT}
                    strokeWidth={STROKE_WIDTH}
                    cx="125.23"
                    cy="118.67"
                    rx="6.47"
                    ry="10.78"
                  />
                  <ellipse
                    fill={FLOWER_STAMEN_COLOR}
                    stroke={STROKE_COLOR}
                    strokeMiterlimit={STROKE_MITERLIMIT}
                    strokeWidth={STROKE_WIDTH}
                    cx="99.13"
                    cy="127.56"
                    rx="6.47"
                    ry="10.78"
                    transform="translate(-62.35 132.37) rotate(-53.85)"
                  />
                  <ellipse
                    fill={FLOWER_STAMEN_COLOR}
                    stroke={STROKE_COLOR}
                    strokeMiterlimit={STROKE_MITERLIMIT}
                    strokeWidth={STROKE_WIDTH}
                    cx="99.13"
                    cy="151.47"
                    rx="6.47"
                    ry="10.78"
                    transform="translate(-64.92 228.01) rotate(-81.81)"
                  />
                </g>
                <g>
                  <path
                    fill={FLOWER_CENTER_COLOR}
                    stroke={STROKE_COLOR}
                    strokeMiterlimit={STROKE_MITERLIMIT}
                    strokeWidth={STROKE_WIDTH}
                    d="M126.24,140.79v11.44s46.12,18.28,47.07,52.18l37.62-10.77s-31.9-39.27-84.69-52.85Z"
                  />
                  <path
                    fill={FLOWER_CENTER_COLOR}
                    stroke={STROKE_COLOR}
                    strokeMiterlimit={STROKE_MITERLIMIT}
                    strokeWidth={STROKE_WIDTH}
                    d="M123.89,151.24s42,15.89,49.57,51.89"
                  />
                  <path
                    fill={FLOWER_CENTER_COLOR}
                    stroke={STROKE_COLOR}
                    strokeMiterlimit={STROKE_MITERLIMIT}
                    strokeWidth={STROKE_WIDTH}
                    d="M126.24,140.79s64.96,23.22,83.74,50.87"
                  />
                </g>
              </g>
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {isLoading
            ? "처리 중..."
            : myLikes >= maxLikesPerIP
              ? `최대 ${maxLikesPerIP}번까지만 좋아요를 누를 수 있습니다!`
              : `재밌게 보셨나요?! 꽃을 피워 주세요~ (${myLikes}/${maxLikesPerIP})`}
        </TooltipContent>
      </Tooltip>
      <div className="flex flex-col">
        <p className="select-none text-sm font-regular">{totalLikes === -1 ? "..." : totalLikes}</p>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </>
  )
}
