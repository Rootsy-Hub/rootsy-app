import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  chatAuthorInitials,
  chatBubbleClusterFlags,
  chatMessageAuthorImageUrl,
  chatThreadKindFromChannel,
} from "@/app/[siteId]/[popId]/chat/chatTypes"

describe("globos de chat", () => {
  it("marca colita solo en el último de una racha del mismo autor", () => {
    const items = [
      { authorUserId: "a" },
      { authorUserId: "a" },
      { authorUserId: "b" },
      { authorUserId: "b" },
      { authorUserId: "b" },
    ]
    assert.deepEqual(chatBubbleClusterFlags(items, 0), {
      firstInCluster: true,
      lastInCluster: false,
    })
    assert.deepEqual(chatBubbleClusterFlags(items, 1), {
      firstInCluster: false,
      lastInCluster: true,
    })
    assert.deepEqual(chatBubbleClusterFlags(items, 2), {
      firstInCluster: true,
      lastInCluster: false,
    })
    assert.deepEqual(chatBubbleClusterFlags(items, 4), {
      firstInCluster: false,
      lastInCluster: true,
    })
  })

  it("trata Equipo y grupos como team, y 2 personas como 1 a 1", () => {
    assert.equal(
      chatThreadKindFromChannel({ isEquipo: true, memberCount: 2 }),
      "team",
    )
    assert.equal(
      chatThreadKindFromChannel({ isEquipo: false, memberCount: 5 }),
      "team",
    )
    assert.equal(
      chatThreadKindFromChannel({ isEquipo: false, memberCount: 2 }),
      "direct",
    )
  })

  it("arma iniciales y resuelve foto del mensaje o del miembro", () => {
    assert.equal(chatAuthorInitials("Ana Pérez"), "AP")
    assert.equal(
      chatMessageAuthorImageUrl(
        { authorUserId: "u1", authorImageUrl: "https://img/me.png" },
        [{ userId: "u1", imageUrl: "https://img/other.png" }],
      ),
      "https://img/me.png",
    )
    assert.equal(
      chatMessageAuthorImageUrl(
        { authorUserId: "u1", authorImageUrl: null },
        [{ userId: "u1", imageUrl: "https://img/other.png" }],
      ),
      "https://img/other.png",
    )
  })
})
