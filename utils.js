// tiles
const tileSize = 5;
const numTileRows = 109; // must be odd
const numTileCols = numTileRows;  // keep panel square (for now)
const offset = (numTileRows-1)/2; // offset of panel center from upper left corner

// canvas 
const canvasWidth = tileSize * numTileCols;
const canvasHeight = tileSize * numTileRows;

// colors
const colorPlayer = "#0000FF" //blue
const colorMountain = "#A52A2A" //brown
const colorField = "#008000" //green

// 2d tile array
var tiles = new Array(numTileCols);
for (i=0; i<numTileCols; i++) {
  tiles[i] = new Array(numTileRows);
} 