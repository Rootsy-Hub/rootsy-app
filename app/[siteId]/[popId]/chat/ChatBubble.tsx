"use client"

import "@/app/[siteId]/[popId]/chat/chatBubble.css"
import {
  chatAuthorInitials,
  chatAuthorNameTone,
  chatStandaloneEmojiCount,
  formatChatTime,
  type ChatThreadKind,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import { Avatar } from "@/components/Avatar"
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
  onInspect?: () => void
}

function ChatBubbleTail({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className={cn(
        "chat-bubble__tail",
        side === "left" ? "chat-bubble__tail--left" : "chat-bubble__tail--right",
      )}
      width="8"
      height="13"
      viewBox="0 0 8 13"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M5.188 0H0v11.193C1.2 8.4 4.1 4.6 6.467 2.568 7.688 1.207 6.959 0 5.188 0z"
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
  onInspect,
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
  const timeLabel = formatChatTime(createdAt)
  const showTime = Boolean(timeLabel) && !hideTime

  return (
    <article
      className={cn(
        "chat-bubble-stack",
        mine ? "chat-bubble-stack--mine" : "chat-bubble-stack--theirs",
        onInspect && "cursor-pointer",
        className,
      )}
      onClick={onInspect}
    >
      <div className={cn("chat-bubble-row", mine && "chat-bubble-row--mine")}>
        {showAvatarSlot ? (
          showAvatar ? (
            <Avatar
              imageUrl={photo}
              initials={initials}
              size="sm"
              shape="circle"
              tone="light"
            />
          ) : (
            <span className="chat-bubble-avatar-slot" aria-hidden />
          )
        ) : null}
        {emojiCount === 1 ? (
          <div className="chat-bubble-emoji-plain-wrap">
            <p className="chat-bubble-emoji-plain">{text}</p>
            {showTime ? (
              <time
                className={cn("chat-bubble-time font-canopy", timeClassName)}
                dateTime={createdAt}
              >
                {timeLabel}
              </time>
            ) : null}
          </div>
        ) : (
          <div
            className={cn(
              "chat-bubble font-canopy",
              mine ? "chat-bubble--mine" : "chat-bubble--theirs",
              withTail && (mine ? "chat-bubble--tail-right" : "chat-bubble--tail-left"),
              emojiCount === 2 && "chat-bubble--emoji chat-bubble--emoji-2",
              emojiCount === 3 && "chat-bubble--emoji chat-bubble--emoji-3",
              !emojiCount && "chat-bubble--text",
              showTime && "chat-bubble--timed",
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
            <p className="chat-bubble__body">
              {text}
              {showTime && !emojiCount ? (
                <span className="chat-bubble-time-pad font-canopy" aria-hidden>
                  {timeLabel}
                </span>
              ) : null}
            </p>
            {showTime ? (
              <time
                className={cn("chat-bubble-time font-canopy", timeClassName)}
                dateTime={createdAt}
              >
                {timeLabel}
              </time>
            ) : null}
            {withTail ? <ChatBubbleTail side={mine ? "right" : "left"} /> : null}
          </div>
        )}
      </div>
    </article>
  )
}
