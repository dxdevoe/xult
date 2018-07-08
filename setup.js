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
        /**
        * Redraws the tile at the given position
        */
        ctx = theCanvas.context;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, tileSize, tileSize);
    }
}

function updateCanvas() {
}
