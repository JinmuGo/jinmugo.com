interface OpengraphImageProps {
  title: string
  summary?: string
}

export const OpenGraphImage = ({ title, summary }: OpengraphImageProps) => {
  const width = 1200
  const height = 630

  return (
    <div
      style={{
        display: "flex",
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: "url('https://cdn.jinmu.me/hero-image.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#f3f4f6", // fallback 배경색
        position: "relative",
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* 어두운 오버레이 - 텍스트 가독성을 위해 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
      />

      {/* 왼쪽 아래 텍스트 영역 */}
      <div
        style={{
          position: "absolute",
          bottom: 46,
          left: 39,
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "white",
            margin: 0,
            lineHeight: "1.2",
          }}
        >
          {title}
        </h1>

        {/* Summary */}
        {summary && (
          <p
            style={{
              fontSize: "24px",
              color: "#e5e7eb",
              whiteSpace: "pre-wrap",
              margin: 0,
              lineHeight: "1.4",
            }}
          >
            {summary}
          </p>
        )}
      </div>
    </div>
  )
}
