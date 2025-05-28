import { randomInt } from "crypto"
import { getPixelColor, mouseClick, moveMouse } from "robotjs"

import { Jimp } from "jimp"
import screenshotDesktop from "screenshot-desktop"

const args = process.argv.slice(2)

const ARG_NO_CLICK = args.includes("--noclick")
const ARG_BEGIN = args.includes("--begin")
const ARG_VERBOSE = args.includes("--verbose")

type Position = {
  x: number,
  y: number
}

// Config values (Value that most likely will change)

/** Maximum interations before the program will shut off */
const MAX_INTERATIONS = 500

const GRID_COLUMNS = 16
const GRID_ROWS = 16

/** Position of the top-left square in the grid */
const GRID_START = { x: 261, y: 248 }
/** Position of the pixel that determines if the game is over */
const GAME_OVER_PIXEL_POS = { x: 508, y: 204 }

const GAME_WON_PIXEL_POS = { x: 516, y: 190 }


// Magic values (Values that can change, but shouldn't be unless you are using a different colour scheme or something)

/** Size of each square on the screen in pixels */
const SQUARE_SIZE = {
  x: 32,
  y: 32
}

/** The offset from the top-left to get the colour of the number in the square */
const SQUARE_VALUE_OFFSET = {
  x: 18,
  y: 22
}

/** Colour of the pixel (uses same as number offset) to be determined a flag */
const FLAG_SQUARE_COLOUR = "000000"

/** Colour of the pixel used to determine if the game is over yet or not */
const GAME_OVER_PIXEL_COLOUR = "000000"

/** Colour of the pixel used to determine if the game is over yet or not */
const GAME_WON_PIXEL_COLOUR = "000000"

/** Colour for when a square has not been clicked yet */
const UNKNOWN_SQUARE_COLOUR = "ffffff"

/** Colour for an empty tile */
const EMPTY_SQUARE_COLOUR = "bdbdbd"

const NUMBER_SQUARE_COLOURS = [
  // 1 (blue)
  "0000ff",
  // 2 (green)
  "007b00",
  // 3 (red)
  "ff0000",
  // 4 (dark-blue)
  "00007b",
  // 5 (dark-red)
  "7b0000",
  // 6 (cyan)
  "007b7b",
  // 7 (black)
  "000000",
  // 8 (gray)
  "7b7b7b"
]


/**
 * Finds the position (top-left) of any square in the minesweeper grid 
 */
function getSquarePos(squareX: number, squareY: number): Position {
  return {
    x: GRID_START.x + (SQUARE_SIZE.x * squareX) + 1,
    y: GRID_START.y + (SQUARE_SIZE.y * squareY) + 1
  }
}

enum SquareState {
  /** The state of the square is unknown */
  SAFE_UNKNOWN = -4,
  ERROR = -3,
  FLAG = -2,
  EMPTY = -1,
  UNKNOWN = 0
}

const NON_NUMBER_STATES: number[] = Object.values(SquareState) as number[]

/**
 * Returns number if there is an amonut of mines, otherwise returns square state
 */
function readSquareState(posX: number, posY: number, screen?: any): number {
  let squareColour: string
  let offsetSquareColour: string

  if (!screen) {
    console.log("Warning: using old method to get pixel colour")
    squareColour = getPixelColor(posX, posY)
    offsetSquareColour = getPixelColor(
      SQUARE_VALUE_OFFSET.x + posX,
      SQUARE_VALUE_OFFSET.y + posY,
    )
  } else {
    squareColour = jimpToString(screen.getPixelColor(posX, posY))
    offsetSquareColour = jimpToString(screen.getPixelColor(
      SQUARE_VALUE_OFFSET.x + posX,
      SQUARE_VALUE_OFFSET.y + posY,
    ))
  }


  if (squareColour == UNKNOWN_SQUARE_COLOUR && offsetSquareColour == FLAG_SQUARE_COLOUR) {
    return SquareState.FLAG;
  }

  if (squareColour == UNKNOWN_SQUARE_COLOUR) {
    return SquareState.UNKNOWN;
  }

  for (let i = 0; i < NUMBER_SQUARE_COLOURS.length; i++) {
    const value = i + 1;
    const colour = NUMBER_SQUARE_COLOURS[i]

    if (offsetSquareColour == colour) {
      return value
    }
  }

  if (offsetSquareColour == EMPTY_SQUARE_COLOUR) {
    return SquareState.EMPTY
  }



  return SquareState.ERROR;
}

/** A list of rows, containing a list of columns */
type Grid = number[][]

type GameOverToken = 0x10
const GAME_OVER_TOKEN: GameOverToken = 0x10

type GameWonToken = 0x11
const GAME_WON_TOKEN: GameWonToken = 0x11

async function readGrid(): Promise<Grid | GameOverToken | GameWonToken> {
  const grid: Grid = new Array(GRID_ROWS)

  const screenshot = await screenshotDesktop({
    format: "png"
  })
  const jimp = await Jimp.read(screenshot)

  function jimpCheck(pos: Position, colour: string) {
    return jimpToString(jimp.getPixelColor(pos.x, pos.y)) == colour
  }

  if (jimpCheck(GAME_OVER_PIXEL_POS, GAME_OVER_PIXEL_COLOUR)) {
    return GAME_OVER_TOKEN
  }

    if (jimpCheck(GAME_WON_PIXEL_POS, GAME_WON_PIXEL_COLOUR)) {
    return GAME_WON_TOKEN
  }

  for (let y = 0; y < GRID_ROWS; y++) {
    const row = new Array(GRID_COLUMNS)
    
    for (let x = 0; x < GRID_COLUMNS; x++) {
      const squarePos = getSquarePos(x, y)
      const state = readSquareState(squarePos.x, squarePos.y, jimp)
      
      row[x] = state
    }

    grid[y] = row
  }
  return grid
}

/** [realX, realY, value] */
type SurroundingSquare = [number, number, number | null]

function getSurroundingSquares(grid: Grid, x: number, y: number): SurroundingSquare[] {
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

      let surroundingSquares = getSurroundingSquares(grid, x, y)

      const completeSquares = surroundingSquares.filter(square => square[2] != SquareState.UNKNOWN)

      if (completeSquares.length == 8) {
        if (ARG_VERBOSE) {
          console.log("Skip (complete)", x, y)
        }
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
          flagOnGrid(surroundingSquare[0], surroundingSquare[1])
        }
        // Exit entirely to next interation
        continue
      }


    }
  }
}

function logGrid(grid: Grid, highlighted?: number[]) {
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLUMNS; x++) {
      const state = grid[y][x]

      process.stdout.write(translateChar(state))
      process.stdout.write(" ")
    }
    process.stdout.write("\n")
  }
}

function translateChar(state: number) {

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

function jimpToString(pixel: number) {
  return pixel.toString(16)
    .padStart(8, '0')
    .slice(0, 6)
    .toLowerCase()
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