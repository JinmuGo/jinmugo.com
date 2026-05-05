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
        backgroundColor: "#f8fafc",
        position: "relative",
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "12px",
          backgroundColor: "#2563eb",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 0,
          width: "100%",
          height: "4px",
          backgroundColor: "#f59e0b",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 72,
          top: 78,
          width: "260px",
          height: "260px",
          border: "2px solid #cbd5e1",
          borderRadius: "999px",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 164,
          top: 170,
          width: "76px",
          height: "76px",
          backgroundColor: "#2563eb",
          borderRadius: "999px",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 64,
          left: 64,
          width: "900px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "58px",
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
            lineHeight: "1.1",
            wordBreak: "keep-all",
          }}
        >
          {title}
        </h1>

        {/* Summary */}
        {summary && (
          <p
            style={{
              fontSize: "24px",
              color: "#475569",
              whiteSpace: "pre-wrap",
              margin: "18px 0 0 0",
              lineHeight: "1.35",
            }}
          >
            {summary}
          </p>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 56,
          display: "flex",
          color: "#334155",
          fontSize: "24px",
          fontWeight: 700,
        }}
      >
        jinmu.me
      </div>
    </div>
  )
}
