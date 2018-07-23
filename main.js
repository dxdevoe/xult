
// Create the player with given (x,y) starting position in the map.
var rp = Math.round(map.rows / 2);
var cp = Math.round(map.cols / 2);


// Weapon(damage, range, passthrough)
var knife = new Weapon(1, 1, 1);
var bow = new Weapon(1, 4, 1);

// Player(startRow, startCol, health, weapon)
var player = new Player(rp, cp, 20, bow);

// Enemy(startRow, startCol, health, movechance, color)
var enemy = new Enemy(rp+10, cp-6, 3, 0.4, "FF0000");

// Action variables:
var moveCol = 0,
    moveRow = 0,
    attackCol = 0,
    attackRow = 0,
    action = 1;    // flag to check if player has made an action

var hit = 0,
    startTime = null;

// Movement via key event listener:
window.addEventListener('keypress', function (e) {

    action = 1;  // assume an action key will be pressed

    // movement keys:
    if      (e.keyCode == 97)  {moveCol = -1;}   // left
    else if (e.keyCode == 100) {moveCol = 1;}   // right
    else if (e.keyCode == 119) {moveRow = -1;}  // up
    else if (e.keyCode == 115) {moveRow = 1;}   // down

    // attack keys:
    else if (player.weapon.moveCount == 0) {   // there is no currently active shot in play
      if (e.keyCode == 106) { attackCol = -1; } // left
      else if (e.keyCode == 108) { attackCol = 1; }  // right
      else if (e.keyCode == 105) { attackRow = -1; } // up
      else if (e.keyCode == 107) { attackRow = 1; }  // down
    }

    else if (e.keyCode == 32) { } // pass, do nothing 

    else action = 0;  // no action key was pressed

}, false);


function startGame() {
  mapCanvas.start();  // main map canvas
  mapCanvas.clear();
  maskCanvas.start(); // alpha mask for map
  maskCanvas.clear();
  dataCanvas.start();
  dataCanvas.clear();
  window.requestAnimationFrame(loop)  // use our loop() function as callback
}


// Main game loop, first started by a requestAnimationFrame() request
// inside startGame(), which itself starts up from the HTML code.
// 
// Note: timestamp is provided to the callback function by default when
// using requestAnimationFrame().
function loop(timestamp) {
  if (action) {  // player has pressed an action key
    mapCanvas.clear();
    maskCanvas.clear();

    if (enemy.movechance > Math.random()) {
      moveEnemy();
    }

    movePlayer();

    drawTiles();   

    if (attackCol || attackRow) {   // an attack key has been pressed
      attack();
      player.weapon.update();      
    }

    action = 0; // reset action flag to await new key press
  }

  if (enemy.health <= 0) { enemy.color = "AAAAAA"; }

  enemy.update();  
  player.update(); 

  if (hit) { drawHit(timestamp); }  // Display hit animation if hit flag triggered

  requestAnimationFrame(loop);  // paint the current screen state, and run loop() again
}


function drawHit(timestamp) {
  var t = 250; // animation time (ms)
  if (!startTime) startTime = timestamp;
  var progress = timestamp - startTime;
  if (progress < t) {
    var ri = offsetRows - (player.r - enemy.r);    // find tile position on canvas
    var ci = offsetCols - (player.c - enemy.c);
    drawCircle(mapCanvas.context, ri, ci, 0.5, 1.0-progress/t, "00FF66");
  }
  else {  // animation over, reset variables
    hit = 0;
    startTime = null;
  };
}


// Move player based on keyboard input, while restricting movement
// through terrain and preventing movement into enemies.
function movePlayer() {
  var newCol = wrapCol(player.c+moveCol); // check for wraping around map edges
  var newRow = wrapRow(player.r+moveRow);
  if (newRow != enemy.r || newCol != enemy.c) { // make sure player does not move onto enemy
    if (Math.random() <= map.tiles[newRow][newCol].terrain.movement) {
      player.c = newCol;
      player.r = newRow;
    }
  }
  moveCol = 0;  // Reset movement flags
  moveRow = 0;
}


function attack() {
  var ri = 0,
      ci = 0;
  var numEnemiesHit = 0;  // Track how many enemies hit (support passthrough hits)

  if (player.weapon.moveCount == 0) {   // Start new shot at player location
    player.weapon.r = player.r;
    player.weapon.c = player.c; 
  }

  // Move shot in given direction until weapon range reached or enemy has been hit:
  if (player.weapon.moveCount++ < player.weapon.range) {  
    if (attackRow != 0) {
      player.weapon.r += Math.sign(attackRow);
      if (wrapRow(player.weapon.r) == enemy.r && wrapRow(player.weapon.c) == enemy.c) {  // enemy has been hit
        enemy.health -= player.weapon.damage;
        hit = 1;
        reset()
      }
      else if (   wrapRow(player.weapon.r) == enemy.ro 
          && wrapRow(player.weapon.c) == enemy.c
          && wrapRow(enemy.c) == wrapRow(enemy.co) ) {  // enemy moved into shot on same column
        enemy.health -= player.weapon.damage;
        hit = 1;
        reset()
      }      
    }
    else if (attackCol != 0) {
      player.weapon.c += Math.sign(attackCol);
      if (wrapRow(player.weapon.r) == enemy.r && wrapRow(player.weapon.c) == enemy.c) {  // enemy has been hit
        enemy.health -= player.weapon.damage;
        hit = 1;
        reset()
      }
      else if (   wrapRow(player.weapon.r) == enemy.r 
          && wrapRow(player.weapon.c) == enemy.co
          && wrapRow(enemy.r) == wrapRow(enemy.ro) ) {  // enemy moved into shot on same row
        enemy.health -= player.weapon.damage;
        hit = 1;
        reset()
      }         }
  }
  else {  
    reset()
  }

  function reset() {  // Reset variables so attack() won't run until another attack key pressed
    player.weapon.moveCount = 0;
    attackRow = 0;
    attackCol = 0;
    player.weapon.r = player.r;
    player.weapon.c = player.c; 
  }
}


function moveEnemy() {
  var newRow = 0,
      newCol = 0;

  enemy.ro = enemy.r;  // save previous enemy position before moving
  enemy.co = enemy.c;

  var dr = player.r - enemy.r,  // deltas between player & monster
      dc = player.c - enemy.c;

  // Determine movement toward player, taking wrapping around map edge into account.
  if (dr > 0 && dr < map.rows) { newRow = enemy.r + 1; }
  else if (dr < 0) { newRow = enemy.r - 1; } 
  if (dc > 0 && dc < map.cols) { newCol = enemy.c + 1; }
  else if (dc < 0) { newCol = enemy.c - 1; }

  // Move along whichever axis has a larger distance from the player:
  if (Math.abs(dc) > Math.abs(dr)) {  // try to move by column first
    if ( map.tiles[enemy.r][newCol].terrain.movement > 0) {
      enemy.c = newCol;
    }
    else if ( map.tiles[newRow][enemy.c].terrain.movement > 0 ) {
      enemy.r = newRow;
    }
  }
  else {  // try to move by row first
    if ( map.tiles[newRow][enemy.c].terrain.movement > 0 ) {
      enemy.r = newRow;
    }
    else if ( map.tiles[enemy.r][newCol].terrain.movement > 0) {
      enemy.c = newCol;
    }
  }
  if ( (enemy.r == player.r) && (enemy.c == player.c) ) {  // enemy moved onto player, reset to previous 
    enemy.r = enemy.ro;
    enemy.c = enemy.co;
  }
}

function drawTiles() {
  // Check every map tile that appears in the viewport, evaluate its
  // alpha value based on position relative to player, and display the
  // resulting tile:
  for (var ri=0; ri<numViewportRows; ri++) {
    for (var ci=0; ci<numViewportCols; ci++) {
      var r = wrapRow(player.r - offsetRows + ri);  // find absoute map row,col position of target tile
      var c = wrapCol(player.c - offsetCols + ci); 
      map.tiles[r][c].alpha = 1-checkVisibility(ri,ci);
      drawSingleTile(mapCanvas.context, ri, ci, 1, map.tiles[r][c].terrain.color);  // Draw the tile
      drawSingleTile(maskCanvas.context, ri, ci, (1-map.tiles[r][c].alpha), "000000");  // Add alpha

    }
  }
}


function checkVisibility(ri,ci) { 
  // ri,ci = indexed row,col position of target tile within viewport

  var dy = ri - offsetRows,  // map target tile coordinates relative to player location
      dx = ci - offsetCols,
      x, y, m,
      r, c;

  var blocking = 0;   // 1 = fully blocking, 0 = no blocking

  if (dx != 0) {
    m = dy / dx;  // slope of line from center to current tile

    // variables for adjusting blocking based on angle:
    var theta = Math.atan(Math.abs(m));
    var f = 0.8;  // scale factor (adjust as needed)

    if (Math.abs(m) <= 1) {  // |m| < 1 so check via y = m * x
      for (x = Math.sign(dx); Math.abs(x) < Math.abs(dx); x += Math.sign(dx)) {
        y = Math.round(m * x);
        r = wrapRow(player.r + y);
        c = wrapCol(player.c + x);
        blocking += map.tiles[r][c].terrain.blocking * (1+f*Math.sin(theta));  // include angle dependence
      }
    }
    else {  // |m| > 1 so check via x = (1/m) * y
      for (y = Math.sign(dy); Math.abs(y) < Math.abs(dy); y += Math.sign(dy)) {
        x = Math.round((1/m) * y);
        r = wrapRow(player.r + y);
        c = wrapCol(player.c + x);
        blocking += map.tiles[r][c].terrain.blocking * (1+f*Math.cos(theta)); // include angle dependence
      }
    }
  }
  else {  // dx == 0 so m = inf
    for (y = (Math.sign(dy)); Math.abs(y) < Math.abs(dy); y += Math.sign(dy)) {
        r = wrapRow(player.r + y);
        c = wrapCol(player.c);
        blocking += map.tiles[r][c].terrain.blocking;
    }
  }
  return (Math.min(blocking, 1));
}


function dead() {
  window.drawSingleTile(offsetRows, offsetCols, 1, "FF00FF");  // Draw the tile
}






// Wrap (r,c) coordinates across map boundaries.  Two functions are
// used to simplify function calls and reduce computational load.
function wrapRow(r) {
  if (r<0) { r = map.rows + r; }
  else if (r>=map.rows) { r = r - map.rows; }
  return(r);
}
function wrapCol(c) {
  if (c<0) { c = map.cols + c; }
  else if (c>=map.cols) { c = c - map.cols; }
  return(c);
}

