import { useState } from "react"
import EditorialRow from "./EditorialRow"

export interface ExpandField {
  label: string
  value: string
}

export interface EditorialListItem {
  id: string
  num: string
  href: string
  hasEssay: boolean
  cover?: string
  coverAspectRatio: "2/3" | "1/1"
  title: string
  subtitle: string
  oneLiner?: string
  rating?: number
  rightMeta: string
  expandFields: ExpandField[]
  quote?: string
  tags: string[]
}

interface Props {
  items: EditorialListItem[]
}

export default function EditorialList({ items }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id))

  return (
    <ul className="flex flex-col divide-y divide-stone-200 dark:divide-stone-700">
      {items.map((it) => (
        <EditorialRow
          key={it.id}
          item={it}
          isOpen={openId === it.id}
          onToggle={() => toggle(it.id)}
        />
      ))}
    </ul>
  )
}
