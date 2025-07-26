import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface EmbedCardProps {
  title: string;
  image: string;
  description: string;
  url: string;
}

export default function EmbedCard({ title, image, description, url }: EmbedCardProps) {
  return (
    <a className="no-underline" href={url}>
      <Card className="w-full h-32 my-4 flex-row items-center p-0 rounded-md gap-4 overflow-hidden">
        {/* 카드 헤더: 제목, 부제목 */}
        <CardHeader className="basis-1/3 px-0 h-full shrink-0">
          <img
            id="embed-card-image"
            className="!my-0 w-full h-full object-cover"
            src={image}
            alt={title}
          />
        </CardHeader>

        {/* 카드 컨텐츠: 이미지 영역 */}
        <CardContent className="basis-2/3 px-0 py-4">
          <CardTitle className="line-clamp-2">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardContent>
      </Card>
    </a>
  );
}
