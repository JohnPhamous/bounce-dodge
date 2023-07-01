import { GameState, TargetEntity } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import React, { useLayoutEffect, useRef, useState } from "react";

export function Canvas({
  gameState,
  onAddTarget,
  targets,
  onEndGame,
}: {
  gameState: GameState;
  onAddTarget: (newTarget: Omit<TargetEntity, "id">) => void;
  targets: TargetEntity[];
  onEndGame: (collidedTarget: TargetEntity) => void;
}): JSX.Element {
  const [xDirection, setXDirection] = useState(Math.random() * 2 - 1);
  const [yDirection, setYDirection] = useState(Math.random() * 2 - 1);
  const attackerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Centers the attacker in the canvas before the game starts.
  useLayoutEffect(() => {
    if (gameState === "pregame") {
      if (attackerRef.current === null || canvasRef.current === null) {
        return;
      }

      const canvas = canvasRef.current;
      const attacker = attackerRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      const attackerRect = attacker.getBoundingClientRect();

      setPosition(attacker, {
        x: canvasRect.width / 2 - attackerRect.width / 2,
        y: canvasRect.height / 2 - attackerRect.height / 2,
      });
    }
  }, [gameState]);

  useLayoutEffect(() => {
    if (gameState !== "playing") {
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
        onEndGame(collidedWithTarget);
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

      animationFrameId = requestAnimationFrame(renderFunction);
    };
    renderFunction();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, xDirection, yDirection, targets, onEndGame]);

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

        let initialX = clickCoordinates.x - canvasRect.left;
        let initialY = clickCoordinates.y - canvasRect.top;

        // TODO: do bounds checking

        onAddTarget({
          value: "TODO",
          initialCoordinates: {
            initialX,
            initialY,
          },
        });
      }}
    >
      <Object ref={attackerRef} label="ATTACKER" />
      <AnimatePresence>
        {targets.map((target) => {
          return (
            <Object
              id={target.id}
              key={target.id}
              initialX={target.initialCoordinates.initialX}
              initialY={target.initialCoordinates.initialY}
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
  { initialX?: number; initialY?: number; label?: string; id?: string }
>(({ initialX = 0, initialY = 0, label = "TARGET", id }, ref) => {
  return (
    <motion.div
      initial={{
        scale: 0,
      }}
      animate={{
        scale: 1,
      }}
      exit={{
        scale: 0,
      }}
      id={id}
      className={`${
        label === "ATTACKER" ? "bg-red-400" : "bg-blue-400"
      } h-24 w-24 absolute top-[var(--y,var(--initial-y))] left-[var(--x,var(--initial-x))]`}
      ref={ref}
      style={
        {
          "--initial-x": `${initialX}px`,
          "--initial-y": `${initialY}px`,
        } as React.CSSProperties
      }
    >
      {label}
    </motion.div>
  );
});

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
