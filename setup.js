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

function startGame() {
    /**
    * Runs when the webpage loads, sets up the canvas and everything on the canvas (player, terrain)
    */
    theCanvas.start();
    setupTiles();
    theCanvas.clear();
    setAlpha();
    drawPlayer();
}

var theCanvas = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateCanvas, 20);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function Tile(color, x, y, alpha, blocking) {
    /**
     * A single tile on the board
     * 
     * @param {String} color - the word of the color of the tile (eg blue, brown)
     * @param {Number} x - the x coordinate of the tile
     * @param {Number} y - the y coordinate of the tile
     * @param {Number} alpha - how transparent the tile is (invisible at 1 blocking value)
     * @param {Number} blocking - a value from 0 to 1; how hard it is to see through the tile. 
       At 1, the player cannot see anything past it.
     */

    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = alpha; 
    this.blocking = blocking;

    this.update = function() {
        ctx = theCanvas.context;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, tileSize, tileSize);
    }
}

function updateCanvas() {
}
