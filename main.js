
// Create the player with given (x,y) starting position in the map.
var rp = Math.round(map.rows / 2);
var cp = Math.round(map.cols / 2);

// Weapon(damage, range, passthrough)
var knife = new Weapon(1, 1, 1);
var bow = new Weapon(1, 4, 1);

// Player(startRow, startCol, health, weapon)
var player = new Player(rp, cp, 20, bow);

// Enemy(startRow, startCol, health, movechance, moveradius, color)
var enemies = [  
  new Enemy(rp+10, cp-6, 3, 0.8, 10, "#FF0000"),
  new Enemy(rp+12, cp-10, 3, 0.8, 100, "#FFFF00"),
  new Enemy(rp+6, cp-8, 3, 0.8, 10, "#FF00FF")];

// var enemy = new Enemy(rp+10, cp-6, 3, 0.8, 10, "#FF0000");

// Action variables:
var moveCol = 0,
    moveRow = 0,
    attackCol = 0,
    attackRow = 0,
    action = 1;    // flag to check if player has made an action


// Movement via key event listener:
window.addEventListener('keypress', function (e) {
  action = 1;  // assume an action key will be pressed
  // movement keys:
  var k = e.key;  // use key since keyCode and charCode are both deprecated
  if      (k == "a" || k == "A") { moveCol = -1; }  // left
  else if (k == "d" || k == "D") { moveCol = 1;  }  // right
  else if (k == "w" || k == "W") { moveRow = -1; }  // up
  else if (k == "s" || k == "S") { moveRow = 1;  }  // down
  // attack keys:
  else if (player.weapon.moveCount == 0) {   // there is no currently active shot in play
    if      (k == "j" || k == "J") { attackCol = -1; }  // left
    else if (k == "l" || k == "L") { attackCol = 1;  }  // right
    else if (k == "i" || k == "I") { attackRow = -1; }  // up
    else if (k == "k" || k == "K") { attackRow = 1;  }  // down
  }
  else if (e.key == " ") { } // pass, do nothing 
  else action = 0;  // no action key was pressed
}, false);
 

function startGame() {
  mapCanvas.start();  // main map canvas
  mapCanvas.clear();
  maskCanvas.start(); // alpha mask for map
  maskCanvas.clear();
  dataCanvas.start(); // UI canvas
  dataCanvas.clear();

  fanfare.play();   // play opening music

  window.requestAnimationFrame(loop)  // use our loop() function as callback
}


// Main game loop, first started by a requestAnimationFrame() request
// inside startGame(), which itself starts up from the HTML code.
// 
// Note: timestamp is provided to the callback function by default when
// using requestAnimationFrame().
function loop(timestamp) {
  if (action) {  // player has pressed an action key
    mapCanvas.clear();  // clear canvases in prep for redraw
    maskCanvas.clear();

    moveEnemies(enemies[i]);

    movePlayer();   // move player

    drawTiles();    // draw map with alpha mask

    if (attackCol || attackRow) {   // an attack key has been pressed
      attack();
      player.weapon.update();      
    }
    action = 0; // reset action flag to await new key press
  }

  for (var i=0; i<enemies.length; i++) {  // loop through all enemies
    if (enemies[i].health <= 0) {  // enemy has died...
      enemies[i].color = "#AAAAAA"; 
      enemies[i].movechance = 0;
    }  
    enemies[i].update();  // update enemy and player tiles
  }

  player.update(); 

  for (var i=0; i<enemies.length; i++) {  // loop through all enemies
    var enemy = enemies[i];
    if (enemy.hitFlag) {   // Display animation if hit flag on for given enemy
      drawHit(timestamp, enemy); 
    }  
  }

  requestAnimationFrame(loop);  // Display the current screen state, and run loop() again
}


function drawHit(timestamp, enemy) {
  var t = 250; // animation time (ms)
  if (enemy.hitTime == 0) { enemy.hitTime = timestamp; }
  var progress = timestamp - enemy.hitTime;
  if (progress < t) {
    var ri = offsetRows - (player.r - enemy.r);    // find tile position on canvas
    var ci = offsetCols - (player.c - enemy.c);
    drawCircle(mapCanvas.context, ri, ci, 0.5, 1.0-progress/t, "#00FF66");
  }
  else {  // animation over, reset relevant variables
    enemy.hitTime = 0;
    enemy.hitFlag = 0;  
  };
}


// Move player based on keyboard input, while restricting movement
// through terrain and preventing movement into enemies.
function movePlayer() {
  var newCol = wrapCol(player.c+moveCol); // check for wraping around map edges
  var newRow = wrapRow(player.r+moveRow);
  var ontoEnemyFlag = 0;
  for (var i=0; i<enemies.length; i++) {  // loop through all enemies
    var enemy = enemies[i];
    if (newRow == enemy.r && newCol == enemy.c) { // make sure player does not move onto enemy
      ontoEnemyFlag = 1;    // about to move onto enemy, flip flag
    }
  }
  if (Math.random() <= map.tiles[newRow][newCol].terrain.movement && !ontoEnemyFlag) {
    player.c = newCol;
    player.r = newRow;
  }
  moveCol = 0;  // Reset movement flags
  moveRow = 0;
  ontoEnemyFlag = 0;
}


function attack() {
  var ri = 0,
      ci = 0,
      enemy;

  if (player.weapon.moveCount == 0) {   // Start new shot at player location
    player.weapon.r = player.r;
    player.weapon.c = player.c; 
  }

  // Move shot in given direction until weapon range reached or enemy has been hit:
  if (player.weapon.moveCount++ < player.weapon.range) {  
    
    player.weapon.r += Math.sign(attackRow);  // Advance the shot
    player.weapon.c += Math.sign(attackCol);

    for (var i=0; i<enemies.length; i++) {  // loop through all enemies
      enemy = enemies[i];
      // First check if there is a direct hit:
      if (wrapRow(player.weapon.r) == enemy.r && wrapRow(player.weapon.c) == enemy.c) {  // enemy has been hit
        hit(enemy);
      }
      // Next check if enemy moved into shot on same column (avoids j
      else if (attackRow) { 
        if (   wrapRow(player.weapon.r) == enemies[i].ro  // Enemy hit
            && wrapRow(player.weapon.c) == enemies[i].c
            && wrapRow(enemy.c) == wrapRow(enemy.co) ) {  
          hit(enemy);
        }      
      }
      // Finally check if enemy moved into shot on same row:
      else if (attackCol) {    
        if (   wrapRow(player.weapon.r) == enemies[i].r  // Enemy hit
            && wrapRow(player.weapon.c) == enemies[i].co
            && wrapRow(enemy.r) == wrapRow(enemy.ro) ) { 
          hit(enemy);
        }    
      }
    }

  }
  else {  // Weapon has reached end of its range, so end attack
    attackReset()
  }


  function hit(enemy) {
    thud.play();
    enemy.health -= player.weapon.damage;
    enemy.hitFlag = 1;
    attackReset() // Current attack ends after a hit
  }

  function attackReset() {  // Reset variables so attack() won't run until another attack key pressed
    player.weapon.moveCount = 0;
    attackRow = 0;
    attackCol = 0;
    player.weapon.r = player.r;
    player.weapon.c = player.c; 
  }
}


function moveEnemies() {

  for (var i=0; i<enemies.length; i++) {  // loop through all enemies

    var enemy = enemies[i];

    if (enemy.movechance > Math.random()) {  // check if enemy will move

      var newRow = 0,
          newCol = 0;

      enemy.ro = enemy.r;  // save previous enemy position before moving
      enemy.co = enemy.c;

      var dr = player.r - enemy.r,  // deltas between player & monster
          dc = player.c - enemy.c;

      // Only move if enemy is close enough to player:
      if (Math.pow(dr,2) + Math.pow(dc,2) < Math.pow(enemy.moveradius,2)) {

        // Determine movement toward player, taking wrapping around map edge into account.
        if (dr > 0 && dr < map.rows) { newRow = enemy.r + 1; }
        else if (dr < 0) { newRow = enemy.r - 1; } 
        if (dc > 0 && dc < map.cols) { newCol = enemy.c + 1; }
        else if (dc < 0) { newCol = enemy.c - 1; }
      }
      else {  // enemy doesn't "see" player, so move randomly (-1, 0, 1):
        newRow = enemy.r + Math.round(2*Math.random()-1);
        newCol = enemy.c + Math.round(2*Math.random()-1);
      }

      // Move along whichever axis has a larger distance from the player:
      if (Math.abs(dc) > Math.abs(dr)) {  // try to move by column first
        if ( map.tiles[enemy.r][newCol].terrain.movement > 0) { enemy.c = newCol; }
        else if ( map.tiles[newRow][enemy.c].terrain.movement > 0 ) { enemy.r = newRow; }
      }
      else {  // try to move by row next
        if ( map.tiles[newRow][enemy.c].terrain.movement > 0 ) { enemy.r = newRow; }
        else if ( map.tiles[enemy.r][newCol].terrain.movement > 0) { enemy.c = newCol; }
      }
      if ( (enemy.r == player.r) && (enemy.c == player.c) ) {  // enemy moved onto player, reset to previous 
        enemy.r = enemy.ro;
        enemy.c = enemy.co;
      }

      // Prevent enemy from moving onto another enemy:
      for (var j=0; j<enemies.length; j++) {  // loop through all enemies
        if (i!=j) {
          if ( (enemy.r == enemies[j].r) && (enemy.c == enemies[j].c) ) {  // enemy moved onto another enemy 
            enemy.r = enemy.ro;
            enemy.c = enemy.co;
          }
        }
      }

    }
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
      drawSingleTile(maskCanvas.context, ri, ci, (1-map.tiles[r][c].alpha), "#000000");  // Add alpha

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

