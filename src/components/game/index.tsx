"use client";

import { Canvas } from "@/components/canvas";
import { Button } from "@/components/ui/button";
import { GameState, TargetEntity } from "@/types";
import React, { useState } from "react";

export function Game(): JSX.Element {
  const [gameState, setGameState] = useState<GameState>("pregame");
  const [targets, setTargets] = useState<TargetEntity[]>([]);
  const [eliminatedTargets, setEliminatedTargets] = useState<TargetEntity[]>(
    []
  );

  const onAddTarget = ({
    initialCoordinates,
    value,
  }: Omit<TargetEntity, "id">) => {
    setTargets((prev) => [
      ...prev,
      //       TODO: use ID generator
      { id: Math.random().toString(), initialCoordinates, value },
    ]);
  };

  const onEndGame = (collidedTarget: TargetEntity) => {
    setTargets((prev) =>
      prev.filter((target) => target.id !== collidedTarget.id)
    );
    setEliminatedTargets((prev) => [...prev, collidedTarget]);
  };

  return (
    <>
      <div className="hidden flex-col space-y-4 sm:flex md:order-2">
        <div className="grid gap-2">yo</div>
        <div>
          {eliminatedTargets.map((target) => {
            return <div key={target.id}>{target.value}</div>;
          })}
        </div>
      </div>
      <div className="md:order-1">
        <div className="flex h-full flex-col space-y-4">
          <div className="min-h-[400px] flex-1 md:min-h-[700px] lg:min-h-[700px]">
            <Canvas
              gameState={gameState}
              onAddTarget={onAddTarget}
              targets={targets}
              onEndGame={onEndGame}
            />
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
    </>
  );
}
