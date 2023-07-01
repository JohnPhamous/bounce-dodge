"use client";

import { Canvas } from "@/components/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GameState, TargetEntity } from "@/types";
import React, { useState } from "react";

export function Game(): JSX.Element {
  const [gameState, setGameState] = useState<GameState>("pregame");
  const [targets, setTargets] = useState<TargetEntity[]>([]);
  const [eliminatedTargets, setEliminatedTargets] = useState<TargetEntity[]>(
    []
  );
  const [username, setUsername] = useState("boba");

  const onAddTarget = ({
    initialCoordinates,
    value,
  }: Omit<TargetEntity, "id">) => {
    setTargets((prev) => [
      ...prev,
      //       TODO: use ID generator
      { id: Math.random().toString(), initialCoordinates, value: username },
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
      <div className="hidden h-max flex-col md:flex">
        <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold whitespace-nowrap">
            Bounce Dodge
          </h2>
          <div className="ml-auto flex w-full space-x-2 sm:justify-end">
            <div className="flex flex-row items-center gap-4">
              <Label htmlFor="username" className="w-fit">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
        <Separator />
        <div className="container h-full py-6">
          <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px]">
            <div className="hidden flex-col space-y-4 sm:flex md:order-2">
              <div>TODO TIMER</div>
              <div>
                {eliminatedTargets.map((target) => {
                  // todo add time
                  return <div key={target.id}>☠️ {target.value} 12s</div>;
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
                      setGameState(
                        gameState === "pregame" ? "playing" : "pregame"
                      );
                    }}
                  >
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
