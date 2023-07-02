import { GameState, TargetEntity } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  useBroadcastEvent,
  useEventListener,
  useMutation,
  useOthers,
  useSelf,
  useStorage,
} from "../../../liveblocks.config";
import { Button } from "@/components/ui/button";

export function Canvas({
  gameState,
  onAddTarget,
  targets,
  onRemoveTarget,
}: {
  gameState: GameState;
  onAddTarget: (newTarget: Omit<TargetEntity, "id">) => void;
  targets: TargetEntity[];
  onRemoveTarget: (collidedTarget: TargetEntity) => void;
}): JSX.Element {
  const self = useSelf();
  const others = useOthers();
  const isAdmin = self.presence.username === "johnphamous";
  const attackerPosition = useStorage((root) => root.attacker);
  const updateAttackerPosition = useMutation(
    ({ storage }, newPosition: { x: number; y: number }) => {
      storage.get("attacker").update(newPosition);
    },
    []
  );
  const broadcast = useBroadcastEvent();
  const [xDirection, setXDirection] = useState(Math.random() * 2 - 1);
  const [yDirection, setYDirection] = useState(Math.random() * 2 - 1);
  const attackerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEventListener(({ connectionId, event }) => {
    let xDelta = 0;
    let yDelta = 0;
    const MAGNITUDE = 0.2;

    switch (event.type) {
      case "up":
        yDelta = -MAGNITUDE;
        break;
      case "down":
        yDelta = MAGNITUDE;
        break;
      case "left":
        xDelta = -MAGNITUDE;
        break;
      case "right":
        xDelta = MAGNITUDE;
        break;
    }

    setXDirection((prev) => prev + xDelta);
    setYDirection((prev) => prev + yDelta);
    console.log(connectionId, event, others);
  });

  // Centers the attacker in the canvas before the game starts.
  useLayoutEffect(() => {
    if (gameState === "pregame" && isAdmin) {
      if (attackerRef.current === null || canvasRef.current === null) {
        return;
      }

      const canvas = canvasRef.current;
      const attacker = attackerRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      const attackerRect = attacker.getBoundingClientRect();

      const xRange = canvasRect.width - attackerRect.width;
      const yRange = canvasRect.height - attackerRect.height;

      const newX = Math.random() * xRange;
      const newY = Math.random() * yRange;

      setPosition(attacker, {
        x: newX,
        y: newY,
      });
      updateAttackerPosition({
        x: newX,
        y: newY,
      });
      setYDirection(Math.random() * 2 - 1);
      setXDirection(Math.random() * 2 - 1);
    }
  }, [gameState, isAdmin, updateAttackerPosition]);

  useLayoutEffect(() => {
    if (gameState !== "playing" || !isAdmin) {
      return;
    }
    let animationFrameId: number;

    const renderFunction = () => {
      if (attackerRef.current === null || canvasRef.current === null) {
        return;
      }

      const canvas = canvasRef.current;
      const attacker = attackerRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      const attackerRect = attacker.getBoundingClientRect();
      const attackerCoordinates = getRelativeCoordinates(
        canvasRect,
        attackerRect
      );

      const collidedWithTarget = getCollision(attackerRect, targets);
      if (collidedWithTarget !== undefined) {
        onRemoveTarget(collidedWithTarget);
      }

      if (
        attackerCoordinates.x + xDirection >
          canvasRect.width - attackerRect.width ||
        attackerCoordinates.x + xDirection < 0
      ) {
        setXDirection(-xDirection);
      }
      if (
        attackerCoordinates.y + yDirection >
          canvasRect.height - attackerRect.height ||
        attackerCoordinates.y + yDirection < 0
      ) {
        setYDirection(-yDirection);
      }

      setPosition(attacker, {
        x: attackerCoordinates.x + xDirection,
        y: attackerCoordinates.y + yDirection,
      });
      updateAttackerPosition({
        x: attackerCoordinates.x + xDirection,
        y: attackerCoordinates.y + yDirection,
      });

      animationFrameId = requestAnimationFrame(renderFunction);
    };
    renderFunction();
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    gameState,
    xDirection,
    yDirection,
    targets,
    onRemoveTarget,
    updateAttackerPosition,
    isAdmin,
  ]);

  return (
    <div
      className="bg-slate-400 h-full w-full relative"
      ref={canvasRef}
      onClick={(e) => {
        if (canvasRef.current === null || gameState !== "pregame") {
          return;
        }

        const clickCoordinates = { x: e.clientX, y: e.clientY };
        const canvas = canvasRef.current;
        const canvasRect = canvas.getBoundingClientRect();

        let x = clickCoordinates.x - canvasRect.left;
        let y = clickCoordinates.y - canvasRect.top;

        // TODO: do bounds checking

        onAddTarget({
          value: "TODO",
          coordinates: {
            x,
            y,
          },
        });
      }}
    >
      <Object
        ref={attackerRef}
        label="ATTACKER"
        x={isAdmin ? undefined : attackerPosition.x}
        y={isAdmin ? undefined : attackerPosition.y}
        hidden={gameState !== "playing"}
        className="group"
      >
        <InfluenceButton
          className="absolute top-0 left-0 right-0 mx-auto w-fit translate-y-[calc(-100%-6px)]"
          onClick={() => {
            broadcast({ type: "up" });
          }}
        >
          ☝️
        </InfluenceButton>
        <InfluenceButton
          className="absolute top-0 bottom-0 right-0 my-auto w-fit translate-x-[calc(100%+6px)]"
          onClick={() => {
            broadcast({ type: "right" });
          }}
        >
          🫱
        </InfluenceButton>
        <InfluenceButton
          className="absolute bottom-0 left-0 right-0 mx-auto w-fit translate-y-[calc(100%+6px)]"
          onClick={() => {
            broadcast({ type: "down" });
          }}
        >
          👇
        </InfluenceButton>
        <InfluenceButton
          className="absolute top-0 bottom-0 left-0 my-auto w-fit translate-x-[calc(-100%-6px)]"
          onClick={() => {
            broadcast({ type: "left" });
          }}
        >
          🫲
        </InfluenceButton>
      </Object>
      <AnimatePresence>
        {targets.map((target) => {
          return (
            <Object
              id={target.id}
              key={target.id}
              initialX={target.coordinates.x}
              initialY={target.coordinates.y}
              label={target.value}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

const Object = React.forwardRef<
  HTMLDivElement,
  {
    initialX?: number;
    initialY?: number;
    label?: string;
    id?: string;
    x?: number;
    y?: number;
    hidden?: boolean;
    children?: React.ReactNode;
    className?: string;
  }
>(
  (
    {
      initialX = 0,
      initialY = 0,
      label = "TARGET",
      id,
      x,
      y,
      hidden,
      children,
      className,
    },
    ref
  ) => {
    return (
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
          opacity: hidden ? 0 : 1,
          transition: {
            duration: hidden ? 0 : undefined,
          },
        }}
        exit={{
          scale: 0,
        }}
        id={id}
        className={`${
          label === "ATTACKER" ? "bg-red-400" : "bg-blue-400"
        } h-24 w-24 absolute top-[var(--y,var(--initial-y))] left-[var(--x,var(--initial-x))] ${
          x !== undefined ? "transition-all" : undefined
        } ${className}`}
        ref={ref}
        style={
          {
            "--initial-x": `${initialX}px`,
            "--initial-y": `${initialY}px`,
            "--x": x !== undefined ? `${x}px` : undefined,
            "--y": y !== undefined ? `${y}px` : undefined,
          } as React.CSSProperties
        }
      >
        {label}
        {children}
      </motion.div>
    );
  }
);

Object.displayName = "Object";

const getRelativeCoordinates = (parent: DOMRect, child: DOMRect) => {
  return {
    x: child.x - parent.x,
    y: child.y - parent.y,
  };
};

const setPosition = (
  element: HTMLElement,
  { x, y }: { x: number; y: number }
) => {
  element.style.setProperty("--x", `${x}px`);
  element.style.setProperty("--y", `${y}px`);
};

function getCollision(attackerRect: DOMRect, targets: TargetEntity[]) {
  const collidedTarget = targets.find((target) => {
    const targetElement = document.getElementById(target.id)!;
    const targetRect = targetElement.getBoundingClientRect();

    return !(
      targetRect.left > attackerRect.right ||
      targetRect.right < attackerRect.left ||
      targetRect.top > attackerRect.bottom ||
      targetRect.bottom < attackerRect.top
    );
  });
  return collidedTarget;
}

const InfluenceButton = ({
  className,
  children,
  onClick,
}: {
  children: React.ReactNode;
  className: string;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${className} aspect-square opacity-0 group-hover:opacity-100 transition-opacity z-50`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </Button>
  );
};
