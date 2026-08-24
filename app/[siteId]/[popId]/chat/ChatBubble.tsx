"use client"

import "@/app/[siteId]/[popId]/chat/chatBubble.css"
import {
  chatAuthorInitials,
  chatAuthorNameTone,
  chatStandaloneEmojiCount,
  formatChatTime,
  type ChatThreadKind,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import { cn } from "@/lib/utils"

type Props = {
  variant: ChatThreadKind
  mine: boolean
  body: string
  authorName: string
  authorUserId: string
  authorImageUrl?: string | null
  createdAt: string
  firstInCluster: boolean
  lastInCluster: boolean
  /** Si se omite, la colita sigue a `lastInCluster`. */
  tail?: boolean
  pending?: boolean
  hideTime?: boolean
  timeClassName?: string
  className?: string
}

function ChatBubbleTail({ side }: { side: "left" | "right" }) {
  if (side === "left") {
    return (
      <svg
        className="chat-bubble__tail chat-bubble__tail--left"
        width="8"
        height="13"
        viewBox="0 0 8 13"
        aria-hidden
      >
        <path
          d="M1.533 2.568 8 11.193V0H2.812C1.04 0 .312 1.207 1.533 2.568z"
          fill="currentColor"
        />
      </svg>
    )
  }
  return (
    <svg
      className="chat-bubble__tail chat-bubble__tail--right"
      width="8"
      height="13"
      viewBox="0 0 8 13"
      aria-hidden
    >
      <path
        d="M5.188 0H0v11.193l6.467-8.625C7.688 1.207 6.959 0 5.188 0z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ChatBubble({
  variant,
  mine,
  body,
  authorName,
  authorUserId,
  authorImageUrl,
  createdAt,
  firstInCluster,
  lastInCluster,
  tail,
  pending,
  hideTime,
  timeClassName,
  className,
}: Props) {
  const text = body.trim()
  const emojiCount = chatStandaloneEmojiCount(text)
  const hasBubble = Boolean(text) && emojiCount !== 1
  const withTail = hasBubble && (tail ?? lastInCluster)
  const showName = variant === "team" && !mine && firstInCluster && hasBubble
  const showAvatarSlot = variant === "team" && !mine
  const showAvatar = showAvatarSlot && lastInCluster
  const photo = authorImageUrl?.trim() || null
  const initials = chatAuthorInitials(authorName)

  return (
    <article
      className={cn(
        "chat-bubble-stack",
        mine ? "chat-bubble-stack--mine" : "chat-bubble-stack--theirs",
        className,
      )}
    >
      <div className={cn("chat-bubble-row", mine && "chat-bubble-row--mine")}>
        {showAvatarSlot ? (
          showAvatar ? (
            <span className="chat-bubble-avatar" aria-hidden>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" />
              ) : (
                <span className="chat-bubble-avatar__initials font-canopy">
                  {initials}
                </span>
              )}
            </span>
          ) : (
            <span className="chat-bubble-avatar-slot" aria-hidden />
          )
        ) : null}
        {emojiCount === 1 ? (
          <p className="chat-bubble-emoji-plain">{text}</p>
        ) : (
          <div
            className={cn(
              "chat-bubble font-canopy",
              mine ? "chat-bubble--mine" : "chat-bubble--theirs",
              withTail && (mine ? "chat-bubble--tail-right" : "chat-bubble--tail-left"),
              emojiCount === 2 && "chat-bubble--emoji chat-bubble--emoji-2",
              emojiCount === 3 && "chat-bubble--emoji chat-bubble--emoji-3",
              !emojiCount && "chat-bubble--text",
              pending && "opacity-70",
            )}
          >
            {showName ? (
              <p
                className={cn(
                  "chat-bubble__name font-canopy",
                  chatAuthorNameTone(authorUserId),
                )}
              >
                {authorName}
              </p>
            ) : null}
            <p className="chat-bubble__body">{text}</p>
            {withTail ? <ChatBubbleTail side={mine ? "right" : "left"} /> : null}
          </div>
        )}
      </div>
      {hideTime || !lastInCluster ? null : (
        <time
          className={cn(
            "chat-bubble-time font-canopy",
            mine && "self-end",
            showAvatarSlot && "ml-[2.125rem]",
            timeClassName,
          )}
        >
          {formatChatTime(createdAt)}
        </time>
      )}
    </article>
  )
}
