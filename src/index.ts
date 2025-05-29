import { randomInt } from "crypto";
import { mouseClick, moveMouse } from "robotjs";


import {
  MAX_INTERATIONS,
  GRID_COLUMNS,
  GRID_ROWS
} from "./config";
import { Grid } from "./types";
import { SquareState } from "./enum/SquareState";
import { getSquarePos } from "./utils/position";
import { getSurroundingSquares } from "./utils/grid";
import { flagPositions, GAME_OVER_TOKEN, GAME_WON_TOKEN, readGrid, safePositions } from "./screen";
import { combineXY } from "./utils/numbers";

const args = process.argv.slice(2)

const ARG_NO_CLICK = args.includes("--noclick")
const ARG_BEGIN = args.includes("--begin")
const ARG_VERBOSE = args.includes("--verbose")


const NON_NUMBER_STATES: number[] = Object.values(SquareState) as number[]

function clickOnGrid(x: number, y: number) {
  const pos = getSquarePos(x, y)
  if (ARG_NO_CLICK) {
    return
  }
  moveMouse(pos.x, pos.y)
  mouseClick("left")
}

function flagOnGrid(x: number, y: number) {
  const pos = getSquarePos(x, y)
  if (ARG_NO_CLICK) {
    return
  }
  moveMouse(pos.x, pos.y)
  mouseClick("right")
}

// Loop through grid
function gridClick(grid: Grid) {
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLUMNS; x++) {
      const state = grid[y][x]

      if (NON_NUMBER_STATES.includes(state)) continue
      const combined = combineXY(x, y)
      if (safePositions.has(combined) || flagPositions.has(combined)) continue

      let surroundingSquares = getSurroundingSquares(grid, x, y)

      const completeSquares = surroundingSquares.filter(square => square[2] != SquareState.UNKNOWN)

      if (completeSquares.length == 8) {
        if (ARG_VERBOSE) {
          console.log("Skip (complete)", x, y)
        }
        safePositions.add(combined)
        continue
      }

      surroundingSquares = surroundingSquares.filter(square => square[2] != null)

      const surroundingFlag = surroundingSquares.filter(square => square[2] == SquareState.FLAG)
      // const surroundingSafeUnknown = surroundingSquares.filter(square => square[2] == SquareState.SAFE_UNKNOWN)

      // If the amount of flags equals the amount of squares, click on everything safe
      if (surroundingFlag.length == state) {
        for (let i = 0; i < surroundingSquares.length; i++) {
          const surroundingSquare = surroundingSquares[i]
          if (surroundingFlag.includes(surroundingSquare)) continue
          // If it's a number ignore it
          if (!NON_NUMBER_STATES.includes(surroundingSquare[2])) continue
          if (ARG_VERBOSE) {
            console.log("Safe", x, y, surroundingSquare)
          }
          grid[surroundingSquare[1]][surroundingSquare[0]] = SquareState.SAFE_UNKNOWN
          clickOnGrid(surroundingSquare[0], surroundingSquare[1])
        }
        continue
      }

      const surroundingUnknown = surroundingSquares.filter(square => square[2] == SquareState.UNKNOWN)
      // If the amount of unknowns and flags are the same as the state, we know it is a bomb
      if ((surroundingUnknown.length + surroundingFlag.length) == state) {
        for (let i = 0; i < surroundingUnknown.length; i++) {
          const surroundingSquare = surroundingUnknown[i]
          if (ARG_VERBOSE) {
            console.log("Flag", x, y, surroundingSquare)
          }
          grid[surroundingSquare[1]][surroundingSquare[0]] = SquareState.FLAG
          flagPositions.add(combineXY(surroundingSquare[0], surroundingSquare[1]))
          flagOnGrid(surroundingSquare[0], surroundingSquare[1])
        }
        // Exit entirely to next interation
        continue
      }


    }
  }
}

async function main() {
  if (ARG_BEGIN) {
    clickOnGrid(randomInt(GRID_COLUMNS), randomInt(GRID_ROWS))
  }

  let grid = await readGrid()

  let i = 0

  while (true) {
    if (i > MAX_INTERATIONS) {
      console.log(`Program shut down due to being over the interation limit (${i}, limit: ${MAX_INTERATIONS})`)
      break
    }

    if (grid == GAME_OVER_TOKEN) {
      console.log(`Game lost`)
      break
    }

    if (grid == GAME_WON_TOKEN) {
      console.log(`Game won`)
      break
    }

    if (!Array.isArray(grid)) {
      console.log("Grid is not array?")
      break
    }

    if (ARG_VERBOSE) {
      console.log(`Interation: ${i}`)
    }

    grid = await readGrid()
    gridClick(grid as Grid)
    i++
  }
}

main()