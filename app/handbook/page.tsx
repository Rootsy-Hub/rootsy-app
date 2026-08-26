import { handbookHomeHref } from "@/app/handbook/layoutHandbookShared"
import { redirect } from "next/navigation"

export default function HandbookIndexPage() {
  redirect(handbookHomeHref())
}
