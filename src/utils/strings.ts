import { GRID_COLUMNS, GRID_ROWS } from "../config"
import { SquareState } from "../enum/SquareState"
import { Grid } from "../types"

export function jimpToString(pixel: number) {
  return pixel.toString(16)
    .padStart(8, '0')
    .slice(0, 6)
    .toLowerCase()
}

export function translateChar(state: number) {

  if (state == SquareState.EMPTY) {
    return "E"
  }
  if (state == SquareState.UNKNOWN) {
    return "0"
  }
  if (state == SquareState.FLAG) {
    return "F"
  }

  if (state == SquareState.SAFE_UNKNOWN) {
    return "U"
  }

  if (state == null) {
    return "/"
  }
  

  if (state == SquareState.ERROR) {
    return "?"
  }
  return state.toString()
}

function logGrid(grid: Grid) {
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLUMNS; x++) {
      const state = grid[y][x]

      process.stdout.write(translateChar(state))
      process.stdout.write(" ")
    }
    process.stdout.write("\n")
  }
}