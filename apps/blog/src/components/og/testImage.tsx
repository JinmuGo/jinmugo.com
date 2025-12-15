interface Props {
  title: string
  summary?: string | null
  category?: string | null
}

export default function (props: Props) {
  const { title, summary, category } = props

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        position: "relative", // 상대 위치 기준점
      }}
    >
      {/* 왼쪽 위 회색 원 */}
      <div
        style={{
          position: "absolute",
          top: -270,
          right: -200,
          width: 500,
          height: 500,
          backgroundColor: "#5F6B7A", // cool-gray-300
          borderRadius: "50%",
        }}
      />
      {/* 오른쪽 아래 회색 원 */}
      <div
        style={{
          position: "absolute",
          bottom: -250,
          left: -150,
          width: 500,
          height: 500,
          backgroundColor: "#d1d5db", // cool-gray-300
          borderRadius: "50%",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          backgroundColor: "#111827",
          color: "white",
          padding: "12px 16px",
          borderRadius: 30,
          width: "12%",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          textTransform: "capitalize",
        }}
      >
        <span>{category}</span>
      </div>

      {/* 상단 OPEN GRAPH 라벨 */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          display: "flex",
          alignItems: "center",
          color: "#4b5563",
        }}
      >
        <svg
          width="208"
          height="61"
          viewBox="0 0 208 61"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Open Graph Logo</title>
          <g clipPath="url(#clip0_366_756)">
            <path d="M66.3233 22.8418H59.363V44.1911H66.3233V22.8418Z" fill="black" />
            <path
              d="M45.4704 33.3546C45.4704 37.8339 41.8277 41.4765 37.3485 41.4765C32.8693 41.4765 29.2266 37.8339 29.2266 33.3546H22.2663C22.2663 41.6725 29.0306 48.4368 37.3485 48.4368C45.6664 48.4368 52.4307 41.6678 52.4307 33.3546V12.2348H45.4704V33.3546Z"
              fill="black"
            />
            <path
              d="M62.8431 19.5911C64.7652 19.5911 66.3233 18.033 66.3233 16.111C66.3233 14.189 64.7652 12.6309 62.8431 12.6309C60.9211 12.6309 59.363 14.189 59.363 16.111C59.363 18.033 60.9211 19.5911 62.8431 19.5911Z"
              fill="black"
            />
            <path
              d="M139.425 19.5911C135.572 19.5911 132.097 21.2499 129.678 23.8887C127.259 21.2499 123.784 19.5911 119.931 19.5911C112.717 19.5911 106.832 25.3993 106.708 32.5843H106.703V44.1863H113.664V32.8137C113.664 29.3575 116.474 26.5466 119.931 26.5466C123.387 26.5466 126.198 29.3575 126.198 32.8137V44.1863H133.158V32.8137C133.158 29.3575 135.969 26.5466 139.425 26.5466C142.881 26.5466 145.692 29.3575 145.692 32.8137V44.1863H152.653V32.5843H152.648C152.523 25.3993 146.644 19.5911 139.425 19.5911Z"
              fill="black"
            />
            <path
              d="M86.5157 19.5911C79.3021 19.5911 73.4174 25.3993 73.2931 32.5843H73.2883V44.1863H80.2486V32.8137C80.2486 29.3575 83.0595 26.5466 86.5157 26.5466C89.9719 26.5466 92.7828 29.3575 92.7828 32.8137V44.1863H99.743V32.5843H99.7383C99.614 25.3993 93.7341 19.5911 86.5157 19.5911Z"
              fill="black"
            />
            <path
              d="M178.806 21.2738V31.1023C178.806 34.5586 175.995 37.3694 172.539 37.3694C169.083 37.3694 166.272 34.5586 166.272 31.1023V21.2738H159.312V31.8003H159.331C159.694 38.7701 165.483 44.3249 172.539 44.3249C174.805 44.3249 176.937 43.7513 178.806 42.7426V44.4731H185.766V21.269H178.806V21.2738Z"
              fill="black"
            />
          </g>
          <defs>
            <clipPath id="clip0_366_756">
              <rect width="208" height="59.43" fill="white" transform="translate(0 0.784973)" />
            </clipPath>
          </defs>
        </svg>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div
        style={{
          display: "flex",
          width: "80%",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* 왼쪽 텍스트 영역 */}
        <div style={{ display: "flex", flexDirection: "column", width: "80%" }}>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              marginTop: 40,
            }}
          >
            {title}
          </h1>
          {summary && (
            <p
              style={{
                fontSize: 24,
                color: "#4b5563",
                marginTop: 20,
                lineHeight: 1.5,
              }}
            >
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
