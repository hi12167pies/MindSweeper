export type Position = {
  x: number,
  y: number
}

export type Grid = number[][]

export type GameOverToken = 0x10

export type GameWonToken = 0x11

/** [realX, realY, value] */
export type SurroundingSquare = [number, number, number | null]