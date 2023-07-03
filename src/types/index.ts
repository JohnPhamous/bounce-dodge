export type GameState = "pregame" | "playing" | "end";

export interface TargetEntity {
  id: string;
  value: string;
  coordinates: {
    x: number;
    y: number;
  };
  color: string;
  owner: string;
}
