"use client";

import { Canvas } from "@/components/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GameEffects, GameState, TargetEntity } from "@/types";
import React, { useEffect } from "react";
import {
  useOthers,
  useUpdateMyPresence,
  useSelf,
  useStorage,
  useMutation,
} from "../../../liveblocks.config";
import { nanoid } from "nanoid";
import { AnimatePresence, motion } from "framer-motion";

export function Game(): JSX.Element {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const self = useSelf();
  const isAdmin = self.presence.isAdmin;

  const gameState = useStorage((root) => root.gameState);
  const targets = useStorage((root) => root.targets);
  const eliminatedTargets = useStorage((root) => root.eliminatedTargets);

  const addTarget = useMutation(({ storage }, newTarget: TargetEntity) => {
    if (gameState === "pregame") {
      const previousIndex = storage
        .get("targets")
        .findIndex((t) => t.owner === self.connectionId.toString());

      if (previousIndex !== -1) {
        storage.get("targets").set(previousIndex, newTarget);
      } else {
        storage.get("targets").push(newTarget);
      }
    }
  }, []);

  const eliminateTarget = useMutation(({ storage }, target: TargetEntity) => {
    const index = storage.get("targets").findIndex((t) => t.id === target.id);
    if (index !== -1) {
      storage.get("targets").delete(index);
      storage.get("eliminatedTargets").push(target);
    }
  }, []);

  const setGameState = useMutation(({ storage }, newGameState: GameState) => {
    storage.set("gameState", newGameState);
  }, []);

  const resetGame = useMutation(({ storage }) => {
    storage.get("targets").clear();
    storage.get("eliminatedTargets").clear();
    setGameState("pregame");
  }, []);

  const onAddTarget = ({
    coordinates,
    value,
    color,
    owner,
  }: Omit<TargetEntity, "id">) => {
    let name = self.presence.username;
    if (name === "" || name === undefined) {
      name = "USING AN EMPTY STRING IS NOT ALLOWED 😈";
    } else if (name.length < 3) {
      name = "YOUR NAME NEEDS TO BE MORE THAN 3 CHARACTERS LONG";
    }
    addTarget({
      id: nanoid(),
      coordinates,
      value: name,
      color,
      owner,
    });
  };

  const onRemoveTarget = (collidedTarget: TargetEntity) => {
    eliminateTarget(collidedTarget);
  };

  // Designate the 1st person joining the room as the admin.
  useEffect(() => {
    if (others.length === 0 || self.presence.username === "johnphamous") {
      updateMyPresence({ isAdmin: true });
    }
    // Only run on app mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effects = getGameEffects(gameState, targets.length);

  return (
    <>
      <div className="flex-col hidden h-max md:flex">
        <div className="container flex flex-col items-start justify-between py-4 space-y-2 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold whitespace-nowrap">
            Bounce Dodge
          </h2>
          <div className="flex w-full ml-auto space-x-2 sm:justify-end">
            {/* Avatar Stack */}
            <div className="flex items-center group">
              <AnimatePresence presenceAffectsLayout mode="popLayout">
                {others
                  .filter(
                    (other) =>
                      other.presence.username !== undefined &&
                      other.presence.username !== ""
                  )
                  .slice(0, 30)
                  .map((other) => {
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: 32 }}
                        key={other.connectionId}
                        className="ml-[-11px] bg-slate-500 border-2 border-slate-50 h-[32px] w-[32px] rounded-full flex items-center justify-center text-white transition-[margin] uppercase"
                        style={{
                          background: other.presence.color,
                        }}
                      >
                        {other.presence.username?.slice(0, 1)}
                      </motion.div>
                    );
                  })}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: 32 }}
                  className="ml-[-11px] bg-slate-500 border-2 border-slate-50 h-[32px] w-[32px] rounded-full flex items-center justify-center text-white transition-[margin] uppercase"
                  style={{
                    background: self.presence.color,
                  }}
                >
                  {self.presence.username?.slice(0, 1)}
                </motion.div>
              </AnimatePresence>
              {others.length > 30 && (
                <p className="ml-1 mr-2 text-xs text-slate-500">
                  +{others.length - 30} others
                </p>
              )}
            </div>
            <div className="flex flex-row items-center gap-4">
              <Input
                aria-label="Username"
                id="username"
                value={self.presence.username}
                onChange={(e) => {
                  updateMyPresence({ username: e.target.value });
                }}
                className="h-8 col-span-2"
              />
            </div>
          </div>
        </div>
        <Separator />
        <div className="container h-full py-6">
          <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px]">
            <div className="flex-col hidden space-y-4 sm:flex md:order-2">
              {gameState === "playing" || eliminatedTargets.length !== 0 ? (
                <ul>
                  {eliminatedTargets.map((target) => {
                    return <li key={target.id}>☠️ {target.value}</li>;
                  })}
                </ul>
              ) : (
                <div className="inline-flex items-center px-2 py-1 font-medium text-red-700 rounded-md text-md bg-red-50 ring-1 ring-inset ring-red-600/10">
                  Type your username ☝️ then click on the board. <br />
                  👈
                </div>
              )}
            </div>
            <div className="md:order-1">
              <div className="flex flex-col h-full space-y-2">
                <div
                  className={`min-h-[400px] flex-1 md:min-h-[700px] lg:min-h-[700px] ${
                    effects === "shake" ? "animate-shake" : ""
                  }${effects === "shake-more" ? "animate-shakeMore" : ""}`}
                >
                  <Canvas
                    gameEffects={effects}
                    gameState={gameState}
                    onAddTarget={onAddTarget}
                    targets={targets as TargetEntity[]}
                    onRemoveTarget={onRemoveTarget}
                  />
                </div>
                <div className="flex items-center">
                  {isAdmin && (
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
                      <Button
                        onClick={() => {
                          resetGame();
                        }}
                        variant="destructive"
                      >
                        Reset
                      </Button>
                    </div>
                  )}
                  <div className="ml-auto -translate-y-2 text-slate-500">
                    <p>
                      {targets.length}/{others.length + 1} Ready
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const getGameEffects = (
  gameState: GameState,
  targetsRemaining: number
): null | GameEffects => {
  if (gameState !== "playing") {
    return null;
  }

  switch (targetsRemaining) {
    case 5:
      return "shake";
    case 4:
      return "shake-more";
    case 3:
    case 2:
    case 1:
    case 0:
      return "evolution";

    default:
      return null;
  }
};
