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

const COLORS = [
  "#AE23F6",
  "#74FAFD",
  "#EF8A33",
  "#0B25F5",
  "#FEFA53",
  "#EA4025",
  "#EA3389",
  "#7AFB4C",
];

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

  const updateAttackerColor = useMutation(({ storage }, newColor: string) => {
    storage.get("attacker").update({ color: newColor });
  }, []);
  const [reactions, setReactions] = useState([]);
  const broadcast = useBroadcastEvent();
  const [xDirection, setXDirection] = useState(Math.random() * 2 - 1);
  const [yDirection, setYDirection] = useState(Math.random() * 2 - 1);
  const attackerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEventListener(({ connectionId, event }) => {
    if (!isAdmin) {
      return;
    }
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
        updateAttackerColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }
      if (
        attackerCoordinates.y + yDirection >
          canvasRect.height - attackerRect.height ||
        attackerCoordinates.y + yDirection < 0
      ) {
        setYDirection(-yDirection);
        updateAttackerColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
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
    updateAttackerColor,
  ]);

  return (
    <div
      className="bg-[#111111] h-full w-full relative"
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
      <AttackerObject
        ref={attackerRef}
        x={isAdmin ? undefined : attackerPosition.x}
        y={isAdmin ? undefined : attackerPosition.y}
        hidden={gameState !== "playing"}
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
        <svg
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          x="0"
          y="0"
          height="60px"
          width="100px"
          viewBox="0 0 500 300"
          fill={attackerPosition.color}
        >
          <path d="M469.9 212.1h-14.7l-.4 2.2h6.2l-2.2 17.3h2.6l2.3-17.3h5.7zM480.1 224.9l-3.1-12.8h-1.8l-6.7 19.5h2.2l5.4-15.1 3.1 15.1 8-15.1v15.1h2.6v-19.5h-2.6zM76.2 282.1 59 249.7H44.3l27.1 49.7h8.4l27.5-49.7H92.2zM141 275.4v24h13.3v-49.7H141zM285 299.4h36.8V291h-23v-13.3h21.7v-8.5h-21.7v-11h23v-8.5H285zM472 188.1c0-18.6-105.6-33.7-236-33.7S0 169.5 0 188.1s105.7 33.7 236 33.7 236-15 236-33.7zm-298.7.5c0-6.2 24.2-11.1 54.1-11.1s54 5 54 11-24.1 11.1-54 11.1-54-5-54-11zM392.3 249.5c-19.3 0-35 11.1-35 24.8s15.7 24.8 35 24.8 35-11 35-24.8c0-13.7-15.7-24.8-35-24.8zm0 40.6c-11.5 0-20.8-7-20.8-15.8 0-8.7 9.3-15.7 20.8-15.7s20.8 7 20.8 15.7-9.3 15.8-20.8 15.8zM214.8 249.7h-21v49.7h21s33.4 0 33.4-24.6-33.4-25-33.4-25zm-7 41.2v-32.7s26.2-1.7 26.2 16.5c0 18.1-26.1 16.2-26.1 16.2zM192 54.3a78 78 0 0 0-4-26.2h1.7L234.5 154 344.5 28h59.3S450 26.8 450 56.5s-38.4 41.2-63 41.2h-10.6l13.8-59.4h-48.3l-20.4 86.4h65.8c63 0 112.8-34.6 112.8-70.4C500 1.3 418.9.6 418.9.6h-102l-64.7 81.6L227 .6H43l-6.7 27.5h61.5c8.7.2 44 2.4 44 28.4 0 29.7-38.4 41.2-62.9 41.2H68.3L82 38.3H33.7l-20.4 86.4h65.8c63 0 112.8-34.6 112.8-70.4z" />
        </svg>
      </AttackerObject>
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

const AttackerObject = React.forwardRef<
  HTMLDivElement,
  {
    id?: string;
    x?: number;
    y?: number;
    hidden?: boolean;
    children?: React.ReactNode;
  }
>(({ id, x, y, hidden, children }, ref) => {
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
      className={`group absolute top-[var(--y,var(--initial-y))] left-[var(--x,var(--initial-x))]`}
      ref={ref}
      style={
        {
          "--x": x !== undefined ? `${x}px` : undefined,
          "--y": y !== undefined ? `${y}px` : undefined,
        } as React.CSSProperties
      }
    >
      {children}
    </motion.div>
  );
});

AttackerObject.displayName = "Attacker";

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
  }
>(({ initialX = 0, initialY = 0, label, id, x, y, hidden }, ref) => {
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
      className={`bg-blue-500 h-24 w-24 absolute top-[var(--y,var(--initial-y))] left-[var(--x,var(--initial-x))] whitespace-break-spaces break-words p-2`}
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
