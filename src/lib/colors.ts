export const COLORS = [
  "#f87171",
  "#fdba74",
  "#fde047",
  "#86efac",
  "#5eead4",
  "#7dd3fc",
  "#c4b5fd",
  "#f0abfc",
  "#f9a8d4",
  "#fda4af",
];

export const getRandomColor = () =>
  COLORS[Math.floor(Math.random() * COLORS.length)];
