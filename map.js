
function setupTiles() {
  for (i=0; i<numTileCols; i++) {
    for (j=0; j<numTileRows; j++) {
      if (Math.random() > 0.2) {
      //if (Math.sin(i/j) > 0.5) {
        c = "green";
        blocking = 0;
      } 
      else {
        c = "brown";
        blocking = 1;
      }
      tiles[i][j] = new Tile(tileSize, tileSize, c, i*tileSize, j*tileSize, null, blocking);
    }
  } 
}

function drawPlayer() {
  player = new Tile(tileSize, tileSize, "blue", offset*tileSize, offset*tileSize, 1, 0);
  player.update();
}


function setAlpha() {
  for (i=0; i<numTileCols; i++) {
    for (j=0; j<numTileRows; j++) {
      tiles[i][j].alpha = checkVisibility(i,j);
      tiles[i][j].update();
    }
  }
}


function checkVisibility(X,Y) { 
  // Loop through each tile to check if it is visible to the player.
  // Start by mapping origin from upper left to panel center.
  // X,Y = col,row of target tile
  // x,y = col,row of each tile between center & target
  Y = offset - Y; 
  X = X - offset;

  visibility = 1; // 1 = no blocking, 0 = fully blocked

  if (X != 0) {
    m = Y / X;  // slope of line from center to current tile
    if (Math.abs(m) <= 1) {  // slope m < 1 so check via y = m * x
      for (x = Math.sign(X); Math.abs(x) < Math.abs(X); x += Math.sign(X)) {
        y = m * x;
        //y_ = Math.round(Math.abs(y) * Math.sign(y));
        y_ = Math.round(y);
        visibility -= tiles[x+offset][offset-y_].blocking;
      }
    }
    else {  // slope m > 1 so check via x = (1/m) * y
      for (y = Math.sign(Y); Math.abs(y) < Math.abs(Y); y += Math.sign(Y)) {
        x = (1/m) * y;
        //x_ = Math.round(Math.abs(x)) * Math.sign(x);
        x_ = Math.round(x);
        visibility -= tiles[x_+offset][offset-y].blocking;
      }
    }
  }
  else { // X == 0 so slope = inf
    for (y = (Math.sign(Y)); Math.abs(y) < Math.abs(Y); y += Math.sign(Y)) {
      visibility -= tiles[offset][offset-y].blocking;
    }
  }
  return (Math.max(visibility, 0));
}
