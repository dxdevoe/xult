const tileSize = 10;
const numTileRows = 59; // must be odd
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

function Tile(width, height, color, x, y, alpha, blocking) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = alpha; // control tile transparency
    this.blocking = blocking;
    this.update = function() {
        ctx = theCanvas.context;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function updateCanvas() {
}


