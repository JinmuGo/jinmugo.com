import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EmbedCardProps {
  title: string
  image: string
  description: string
  url: string
}

export default function EmbedCard({ title, image, description, url }: EmbedCardProps) {
  return (
    <a className="no-underline" href={url}>
      <Card className="w-full h-32 my-4 flex-row items-stretch p-0 rounded-md gap-4 overflow-hidden">
        {/* 카드 헤더: 이미지 영역 */}
        <CardHeader className="basis-1/3 px-0 py-0 h-32 shrink-0 flex items-center justify-center">
          <img
            id="embed-card-image"
            className="!my-0 w-full h-full object-cover min-h-0"
            src={image}
            alt={title}
          />
        </CardHeader>

        {/* 카드 컨텐츠: 제목, 설명 */}
        <CardContent className="basis-2/3 px-4 py-4 flex flex-col justify-center">
          <CardTitle className="line-clamp-2 text-sm leading-tight">{title}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs leading-tight mt-1">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </a>
  )
}
