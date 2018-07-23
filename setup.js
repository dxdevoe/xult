// tiles
const tileSize = 15;
const numViewportRows = 29; // must be odd
const numViewportCols = 49; 
const offsetRows = Math.round((numViewportRows-1)/2); // offset of panel center from upper left corner
const offsetCols = Math.round((numViewportCols-1)/2); 

// canvas (to display viewport)
const mapCanvasWidth = tileSize * numViewportCols;
const mapCanvasHeight = tileSize * numViewportRows;
const dataCanvasWidth = mapCanvasWidth;
const dataCanvasHeight = 100;

// Canvas to draw visible map tiles:
var mapCanvas = {
  canvas : document.createElement("canvas"),
  start : function() {

    this.canvas.width = mapCanvasWidth;
    this.canvas.height = mapCanvasHeight;
    this.context = this.canvas.getContext("2d");

    this.canvas.style.position = 'absolute';  // position canvas to enable overlay by mask
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';

    // document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    document.getElementById("map").appendChild(this.canvas);
  },
  clear : function() {
    this.context.globalAlpha = 1;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Canvas for alpha mask to hide non-visible map tiles:
var maskCanvas = {
  canvas : document.createElement("canvas"), 
  start : function() {

    this.canvas.width = mapCanvasWidth;
    this.canvas.height = mapCanvasHeight;
    this.context = this.canvas.getContext("2d");
    
    this.canvas.style.position = 'absolute';  // position canvas to enable overlay of map
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';

    document.getElementById("map").appendChild(this.canvas);
  },
  clear : function() {
    this.context.globalAlpha = 1;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Canvas for interface elements:
var dataCanvas = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = dataCanvasWidth;
    this.canvas.height = dataCanvasHeight;
    this.context = this.canvas.getContext("2d");
    
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0px';
    this.canvas.style.top = mapCanvasHeight.toString() + 'px';

    document.getElementById("data").appendChild(this.canvas);
  },
  clear : function() {
    this.context.globalAlpha = 1;
    this.context.fillStyle = "AAAAAA";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height, "#AAAAAA");
  }
}

function Terrain(name, color, blocking, movement) {
  this.name = name;
  this.color = color;
  this.blocking = blocking;
  this.movement = movement;
}


function Tile(terrain, r, c, alpha) {
  this.terrain = terrain;
  this.r = r;
  this.c = c;
  this.alpha = alpha; 
}


function Map(name, tileArray) {
  this.name = name;
  this.rows = tileArray.length;
  this.cols = tileArray[0].length;
  this.tiles = new Array(this.cols);
  for (ri=0; ri<this.rows; ri++) {  // create array to hold map tiles
    this.tiles[ri] = new Array(this.cols);
  } 
  for (ri=0; ri<this.rows; ri++) {  // fill in map tiles with terrain based on tileArray values
    for (ci=0; ci<this.cols; ci++) {
      this.tiles[ri][ci] = new Tile(terrain[tileArray[ri][ci]], ri, ci, 1);
    }
  }
}


function Weapon(damage, range, passthrough) {
  this.r = null;  // position of shot from the weapon
  this.c = null;
  this.moveCount = 0; // number of moves for current shot (0 = no current shot in play)

  this.damage = damage;
  this.range = range;
  this.passthrough = passthrough; // # enemies weapon passes through

  this.update = function() {

    var ri = offsetRows - (player.r - this.r);    // find tile position on canvas
    var ci = offsetCols - (player.c - this.c);
    if (ri < 0) { ri = map.rows + ri; }           // did we wrap around the map edge?
    else if (ri >= map.rows) { ri = ri - map.rows; }
    if (ci < 0) { ci = map.cols + ci; }
    else if (ci >= map.cols) { ci = ci - map.cols; }
    drawSingleTile(mapCanvas.context, ri, ci, 1, "#FFFF00");        // Draw the tile
  }
}


function Player(r,c, health, weapon) {
  this.r = r;
  this.c = c;
  this.health = health;
  this.weapon = weapon;
  this.update = function() {
    drawSingleTile(mapCanvas.context, offsetRows, offsetCols, 1, "#FFFFFF"); // Draw the tile
  }
}



/* Enemy class:
    r,c = enemy location
    movechance = chance of moving on any given turn
    moveradius = distance from player at which enemy will start tracking player
*/
function Enemy(r, c, health, movechance, moveradius, color) {
  this.r = r;   // (r,c) = current absolute position
  this.c = c;
  this.ro = r;  // (ro,co) = previous absolute position (used for attack hit tracking)
  this.co = c;
  this.health = health;  
  this.movechance = movechance;
  this.moveradius = moveradius;
  this.color = color;
  this.update = function() {

    // find tile position on canvas
    var ri = offsetRows - (player.r - this.r); 
    var ci = offsetCols - (player.c - this.c);
    // did we wrap around the map edge?
    if (ri < 0) { ri = map.rows + ri; }
    else if (ri >= map.rows) { ri = ri - map.rows; }
    if (ci < 0) { ci = map.cols + ci; }
    else if (ci >= map.cols) { ci = ci - map.cols; }

    // Draw the tile if it appears in the viewort.
    // Make enemy blocking level saame as tile it sits on
    if ((ri < numViewportRows && ri >= 0) && (ci < numViewportCols && ci >= 0)) {
      drawSingleTile(mapCanvas.context, ri, ci, map.tiles[this.r][this.c].alpha, this.color);  // Draw the tile
    }
  }
}


// Draw a tile at local (canvas) coordinates (ri,ci)
function drawSingleTile(ctx, ri, ci, alpha, color) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(ci*tileSize, ri*tileSize, tileSize, tileSize);
}

// Similar to drawSingleTile, but make a circle (use for weapon shot animation)
// radx = radius of circle relative to tileSize
function drawCircle(ctx, ri, ci, radx, alpha, color) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();  // start path (arc in this case)
    ctx.arc((ci+0.5)*tileSize, (ri+0.5)*tileSize, radx*tileSize, 0, 2*Math.PI);
    ctx.fill();       // end path with fill
}


/*
function drawLine(ctx, r, c, color) {
  ctx.beginPath();
  ctx.moveTo((numViewportCols*tileSize)/2, (numViewportRows*tileSize)/2);
  ctx.lineTo((c+1/2)*tileSize, (r+1/2)*tileSize);
  ctx.stroke();
}
*/

