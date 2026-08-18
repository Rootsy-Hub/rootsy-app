import { ROOTSY_EMAIL_THEME as T } from "@/lib/email/rootsyEmailTheme"

export function authEmailParagraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma900}">${html}</p>`
}

export function authEmailMutedParagraph(html: string): string {
  return `<p style="margin:0;font-family:${T.fontFamily};font-size:13px;line-height:1.6;color:${T.bruma500}">${html}</p>`
}
