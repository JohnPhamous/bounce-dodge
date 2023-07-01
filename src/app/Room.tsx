"use client";

import { ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "../../liveblocks.config";

export function Room({ children }: { children: ReactNode }) {
  return (
    // TODO come up with random name
    <RoomProvider id="my-room" initialPresence={{ username: "Unknown" }}>
      <ClientSideSuspense fallback={<div>Loading…</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
