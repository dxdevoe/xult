// tiles
const TILE_SIZE = 5;
const TILE_ROWS = 109; // must be odd
const TILE_COLS = TILE_ROWS;  // keep panel square (for now)
const OFFSET = (TILE_ROWS-1)/2; // offset of panel center from upper left corner

// canvas 
const CANVAS_WIDTH = TILE_SIZE * TILE_COLS;
const CANVAS_HEIGHT = TILE_SIZE * TILE_ROWS;

// colors
const COLOR_PLAYER = "#0000FF" // blue
const COLOR_MOUNTAIN = "#A52A2A" // brown
const COLOR_FIELD = "#008000" // green

// keypress
const KEY_UP = 38; // arrow up
const KEY_DOWN = 40; // arrow down
const KEY_LEFT = 37 // arrow left
const KEY_RIGHT = 39 // arrow right

// 2d tile array
var tiles = new Array(TILE_COLS);
for (i=0; i<TILE_COLS; i++) {
  tiles[i] = new Array(TILE_ROWS);
}


