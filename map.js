function setupTiles() {
  /**
  * Randomly generates terrain and adds to the 2d tile array
  */
  for (i=0; i<TILE_COLS; i++) {
    for (j=0; j<TILE_ROWS; j++) {
      if (Math.random() > 0.2) {
        //if (Math.sin(i/j) > 0.5) {
        c = COLOR_FIELD;
        blocking = 0;
      } 
      else {
        c = COLOR_MOUNTAIN;
        blocking = 1;
      }
      tiles[i][j] = new Tile(c, i*TILE_SIZE, j*TILE_SIZE, null, blocking);
    }
  } 
}

function drawPlayer() {
  /**
  * Draws the player at the center of the map
  */
  player = new Tile(COLOR_PLAYER, OFFSET*TILE_SIZE, OFFSET*TILE_SIZE, 1, 0);
  player.update();
}


function setAlpha() {
  /**
  * Checks every tile and re-evaluates its alpha value based on the player's position relative to it
  */
  for (i=0; i<TILE_COLS; i++) {
    for (j=0; j<TILE_ROWS; j++) {
      tiles[i][j].alpha = checkVisibility(i,j);
      tiles[i][j].update();
    }
  }
}


function checkVisibility(X,Y) { 
  /**
  * Checks how visible the tile at the given coordinates is to the player
  *
  * Start by mapping origin from upper left to panel center.
  * X,Y are col,row of target tile
  * x,y are col,row of each tile between center & target
  *
  * @param {Number} X - the x coordinate of the tile to check
  * @param {Number} Y - the y coordinate of the tile to check
  *
  * @return {Number} the visibility of the tile; 0 if the player cannot see it
  */

  Y = OFFSET - Y; 
  X = X - OFFSET;

  visibility = 1; // 1 = no blocking, 0 = fully blocked

  if (X != 0) {
    m = Y / X;  // slope of line from center to current tile
    if (Math.abs(m) <= 1) {  // slope m < 1 so check via y = m * x
      for (x = Math.sign(X); Math.abs(x) < Math.abs(X); x += Math.sign(X)) {
        y = Math.round(m * x);
        visibility -= tiles[x+OFFSET][OFFSET-y].blocking;
      }
    }
    else {  // slope m > 1 so check via x = (1/m) * y
      for (y = Math.sign(Y); Math.abs(y) < Math.abs(Y); y += Math.sign(Y)) {
        x = Math.round((1/m) * y);
        visibility -= tiles[x+OFFSET][OFFSET-y].blocking;
      }
    }
  }
  else { // X == 0 so slope = inf
    for (y = (Math.sign(Y)); Math.abs(y) < Math.abs(Y); y += Math.sign(Y)) {
      visibility -= tiles[OFFSET][OFFSET-y].blocking;
    }
  }
  return (Math.max(visibility, 0));
}
