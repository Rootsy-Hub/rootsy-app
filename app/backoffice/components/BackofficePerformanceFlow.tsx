import { FoundationBrumaStage } from "@/app/library/libraryFoundationDocShared"
import { libraryDocMetaLabelClass } from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

export type PerformanceFlowNode = {
  label: string
  note?: string
}

export type PerformanceFlowBlock =
  | { type: "step"; node: PerformanceFlowNode }
  | { type: "split"; note?: string; nodes: readonly PerformanceFlowNode[] }
  | { type: "loop"; label: string }

export type PerformanceFlowLane = {
  title?: string
  blocks: readonly PerformanceFlowBlock[]
}

type BackofficePerformanceFlowProps = {
  caption: string
  lanes: readonly PerformanceFlowLane[]
}

function FlowNodeBox({
  node,
  tone = "plain",
}: {
  node: PerformanceFlowNode
  tone?: "plain" | "loop"
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border px-3 py-2.5 text-center",
        tone === "loop"
          ? "border-dashed border-rootsy-bruma-300 bg-transparent"
          : "border-rootsy-bruma-200 bg-white",
      )}
    >
      <p className="font-canopy text-sm font-semibold text-rootsy-bruma-900">
        {node.label}
      </p>
      {node.note ? (
        <p className="mt-0.5 font-canopy text-[11px] leading-relaxed text-rootsy-bruma-500">
          {node.note}
        </p>
      ) : null}
    </div>
  )
}

function FlowConnector() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <span className="h-4 w-px bg-rootsy-bruma-200" />
    </div>
  )
}

function FlowLane({ lane }: { lane: PerformanceFlowLane }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {lane.title ? (
        <li className="mb-3">
          <p className={libraryDocMetaLabelClass}>{lane.title}</p>
        </li>
      ) : null}
      {lane.blocks.map((block, index) => {
        const key =
          block.type === "step"
            ? `step-${block.node.label}`
            : block.type === "loop"
              ? `loop-${block.label}`
              : `split-${block.nodes.map((node) => node.label).join("-")}`

        return (
          <li key={key} className="flex flex-col">
            {index > 0 || lane.title ? <FlowConnector /> : null}
            {block.type === "step" ? (
              <FlowNodeBox node={block.node} />
            ) : null}
            {block.type === "loop" ? (
              <FlowNodeBox
                tone="loop"
                node={{
                  label: block.label,
                  note: "vuelve a pedir",
                }}
              />
            ) : null}
            {block.type === "split" ? (
              <div className="space-y-2">
                {block.note ? (
                  <p className="text-center font-canopy text-[11px] text-rootsy-bruma-500">
                    {block.note}
                  </p>
                ) : null}
                <div
                  className={cn(
                    "grid gap-2",
                    block.nodes.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3",
                  )}
                >
                  {block.nodes.map((node) => (
                    <FlowNodeBox key={node.label} node={node} />
                  ))}
                </div>
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export function BackofficePerformanceFlow({
  caption,
  lanes,
}: BackofficePerformanceFlowProps) {
  return (
    <figure>
      <FoundationBrumaStage caption={caption}>
        <div
          className={cn(
            "grid gap-8",
            lanes.length > 1 ? "sm:grid-cols-2 sm:gap-10" : "max-w-md mx-auto",
          )}
        >
          {lanes.map((lane) => (
            <FlowLane key={lane.title ?? caption} lane={lane} />
          ))}
        </div>
      </FoundationBrumaStage>
    </figure>
  )
}
