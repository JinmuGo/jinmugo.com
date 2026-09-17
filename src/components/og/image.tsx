interface OpengraphImageProps {
  title: string
  summary?: string
  category?: string
  date?: string
}

export const OpenGraphImage = ({ title, summary, category, date }: OpengraphImageProps) => {
  const width = 1200
  const height = 630
  const metaItems = [category, date].filter(Boolean).join(" · ")

  return (
    <div
      style={{
        display: "flex",
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "#f8f7f4",
        position: "relative",
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "Asta Sans",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "64px",
          left: "64px",
          right: "64px",
          height: "1px",
          backgroundColor: "#d9dde3",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "64px",
          right: "64px",
          bottom: "64px",
          height: "1px",
          backgroundColor: "#d9dde3",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "96px",
          left: "64px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "2px",
            marginRight: "18px",
            backgroundColor: "#2f5f8f",
          }}
        />
        {metaItems && (
          <div
            style={{
              color: "#2f5f8f",
              fontSize: "22px",
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          >
            {metaItems}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: "64px",
          bottom: "118px",
          width: "930px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1
          style={{
            fontSize: "76px",
            fontWeight: 700,
            color: "#16181d",
            margin: 0,
            lineHeight: "1.08",
            wordBreak: "keep-all",
          }}
        >
          {title}
        </h1>

        {summary && (
          <p
            style={{
              fontSize: "28px",
              color: "#626a75",
              margin: "24px 0 0 0",
              lineHeight: "1.45",
              overflow: "hidden",
            }}
          >
            {summary}
          </p>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          right: "64px",
          bottom: "54px",
          color: "#404852",
          fontSize: "24px",
          fontWeight: 700,
        }}
      >
        jinmugo.com
      </div>
    </div>
  )
}
