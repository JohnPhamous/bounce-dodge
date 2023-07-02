"use client";

import { ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "../../liveblocks.config";
import { LiveList, LiveObject } from "@liveblocks/client";

export function Room({ children }: { children: ReactNode }) {
  return (
    // TODO come up with random name
    <RoomProvider
      id="my-room"
      initialPresence={{ username: "Unknown" }}
      initialStorage={{
        targets: new LiveList([]),
        eliminatedTargets: new LiveList([]),
        attacker: new LiveObject({ x: 0, y: 0 }),
        gameState: "pregame",
      }}
    >
      {/* TODO loading state */}
      <ClientSideSuspense fallback={<div>Loading…</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
