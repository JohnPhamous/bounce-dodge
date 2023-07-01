"use client";

import { Canvas } from "@/components/canvas";
import { Button } from "@/components/ui/button";
import { GAME_STATE } from "@/types";
import React, { useState } from "react";

export function Game(): JSX.Element {
  const [gameState, setGameState] = useState<GAME_STATE>("pregame");

  return (
    <div className="md:order-1">
      <div className="flex h-full flex-col space-y-4">
        <div className="min-h-[400px] flex-1 md:min-h-[700px] lg:min-h-[700px]">
          <Canvas gameState={gameState} />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              setGameState(gameState === "pregame" ? "playing" : "pregame");
            }}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
