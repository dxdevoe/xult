const tileSize = 3;
const numTileRows = 109; // must be odd
const numTileCols = numTileRows;  // keep panel square (for now)
const offset = (numTileRows-1)/2; // offset of panel center from upper left corner

const canvasWidth = tileSize * numTileCols;
const canvasHeight = tileSize * numTileRows;

// Create 2d array to hold map tiles:
var tiles = new Array(numTileCols);
for (i=0; i<numTileCols; i++) {
  tiles[i] = new Array(numTileRows);
} 

function startGame() {
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
     * width - 
     *
     *
     */
    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = alpha; // control tile transparency
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
