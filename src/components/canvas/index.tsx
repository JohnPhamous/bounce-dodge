import { GAME_STATE } from "@/types";
import React, { useLayoutEffect, useRef, useState } from "react";

export function Canvas({ gameState }: { gameState: GAME_STATE }): JSX.Element {
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
  }, [gameState, xDirection, yDirection]);

  return (
    <div className="bg-slate-400 h-full w-full relative" ref={canvasRef}>
      <Object ref={attackerRef} />
    </div>
  );
}

const Object = React.forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <div
      className="bg-red-400 h-24 w-24 absolute top-[var(--y)] left-[var(--x)]"
      ref={ref}
    >
      yo
    </div>
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
