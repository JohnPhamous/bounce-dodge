export type GameState = "pregame" | "playing" | "end";

export interface TargetEntity {
  id: string;
  value: string;
  initialCoordinates: {
    initialX: number;
    initialY: number;
  };
}
