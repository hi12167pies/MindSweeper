import { Grid, SurroundingSquare } from "../types"

export function getSurroundingSquares(grid: Grid, x: number, y: number): SurroundingSquare[] {
  function getOffset(offsetX: number, offsetY: number): SurroundingSquare {
    const realX = x + offsetX
    const realY = y + offsetY

    const row = grid[realY]
    if (row == undefined) return [realX, realY, null]

    const column = row[realX]
    if (column == undefined) return [realX, realY, null]

    return [realX, realY, column]
  }
  return [
    getOffset(-1, -1),
    getOffset( 0, -1),
    getOffset( 1, -1),

    getOffset(-1, 0),
    getOffset( 1, 0),

    getOffset(-1, 1),
    getOffset( 0, 1),
    getOffset( 1, 1),
  ]
}