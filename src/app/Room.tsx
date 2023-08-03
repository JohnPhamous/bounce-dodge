"use client";

import { ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "../../liveblocks.config";
import { LiveList, LiveObject } from "@liveblocks/client";
import { getRandomColor } from "@/lib/colors";
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  animals,
} from "unique-names-generator";

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: " ",
  length: 2,
  style: "capital",
};

export function Room({ children }: { children: ReactNode }) {
  return (
    <RoomProvider
      id="room"
      initialPresence={{
        username: uniqueNamesGenerator(customConfig),
        color: getRandomColor(),
        isAdmin: false,
      }}
      initialStorage={{
        targets: new LiveList([]),
        eliminatedTargets: new LiveList([]),
        attacker: new LiveObject({ x: 0, y: 0, color: "white" }),
        gameState: "pregame",
      }}
    >
      <ClientSideSuspense fallback={null}>{() => children}</ClientSideSuspense>
    </RoomProvider>
  );
}
