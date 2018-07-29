

// Define array containing all maps:
var maps = [
 new Map("test1", mapArray1),
 new Map("test2", mapArray1) 
 ];

var map = maps[0]; // set the starting map

// Map portals:
// Portal(r, c, targetMapName, targetRow, targetCol) 
idx = findMapIndex("test1");
maps[idx].portals = [
  new Portal(45, 32, "test2", 45, 22) 
  ];
//
idx = findMapIndex("test2");
maps[idx].portals = [
  new Portal(44, 31, "test1", 40, 30) 
  ];


// Set up Boats:
idx = findMapIndex("test1");
maps[idx].boats = [
  new Boat(47, 19)
  ];
idx = findMapIndex("test2");
maps[idx].boats = [
  ];


// Define all game weapons:
// Weapon(damage, range, passthrough)
var knife = new Weapon(1, 1, 1);
var bow = new Weapon(1, 4, 1);


// Player(startRow, startCol, health, weapon)
var rp = Math.round(map.rows / 2);  // rp,cp are temp variables...delete later
var cp = Math.round(map.cols / 2);
var player = new Player(rp, cp, 20, bow);


// Set up Map enemies:
//
// Enemy(startRow, startCol, health, damage, movechance, moveradius, color)
idx = findMapIndex("test1");
maps[idx].enemies.push(new Enemy(rp+10, cp-6, 3, 2, 0.7, 30, "#FF0000"));
maps[idx].enemies.push(new Enemy(rp+12, cp-10, 3, 5, 0.7, 30, "#FFFF00"));
maps[idx].enemies.push(new Enemy(rp+6, cp-8, 3, 10, 0.7, 30, "#FF00FF"));
//
// Enemy(startRow, startCol, health, damage, movechance, moveradius, color)
idx = findMapIndex("test2");
maps[idx].enemies.push(new Enemy(rp+1, cp-4, 3, 2, 0.7, 30, "#FF0000"));
maps[idx].enemies.push(new Enemy(rp+22, cp-20, 3, 5, 0.7, 30, "#FFFF00"));
maps[idx].enemies.push(new Enemy(rp+4, cp-10, 3, 10, 0.7, 30, "#FF00FF"));





// var enemy = new Enemy(rp+10, cp-6, 3, 0.8, 10, "#FF0000");

// Action variables:
var moveCol = 0,
    moveRow = 0,
    attackCol = 0,
    attackRow = 0,
    action = 1;    // flag to check if player has made an action


function startGame() {
  mapCanvas.start();  // main map canvas
  mapCanvas.clear();
  maskCanvas.start(); // alpha mask for map
  maskCanvas.clear();
  weatherCanvas.start();  // canvas to display weather conditions
  weatherCanvas.clear();
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

  if (timestamp > turnTimestamp + maxTurnTime) {   // automatically trigger action if user inactive
    action = 1;
    turnTimestamp = timestamp;
  }

  if (action) {  // player has pressed an action key

    player.food -= foodConsuptionRate;  // reduce player's food level each turn

    mapCanvas.clear();  // clear canvases in prep for redraw
    maskCanvas.clear();
    weatherCanvas.clear();

    movePlayer();   // move player
    checkPortals();  // check is player moved onto a portal
    moveEnemies(map.enemies);   // move all enemies on current map
    drawTiles();    // draw map tiles & alpha mask

    // weatherCanvas.draw(timestamp, "night");

    if (attackCol || attackRow) {   // an attack key has been pressed
      attack(map.enemies);
      player.weapon.draw();      
    }
    action = 0; // reset action flag to await new key press
  }

  drawEnemies();
  drawPortals();  // draw all portals that appear within the viewport
  player.draw();  // draw the player
  drawBoats();

  if (player.hitFlag) { drawHit(timestamp, player); } // Display animation if player hit flag is on

  // Check food level:
  if (player.food < 0) {
    player.food = 0;  // prevent negative food levels
    player.health--;  // hungry damage to player
  }

  if (map.enemies.length > 0) {
    for (var i=0; i<map.enemies.length; i++) {  // loop through all enemies
      var enemy = map.enemies[i];
      if (enemy.hitFlag) {   // Display animation if hit flag on for given enemy
        drawHit(timestamp, enemy); 
      }  
    }
  }

  updateDataCanvas(timestamp);  // need to pass timestamp to support animations

  requestAnimationFrame(loop);  // Display the current screen state, and run loop() again
}


// Check if player has moved onto a portal, and if so change maps:
function checkPortals() {
  for (var i=0; i<map.portals.length; i++) {  // loop through all portals on current map
    if (player.r == map.portals[i].r && player.c == map.portals[i].c) {   // player is on a portal
      player.r = map.portals[i].targetRow;  // set the player location on the new map
      player.c = map.portals[i].targetCol;
      map = maps[findMapIndex(map.portals[i].targetMapName)];  // switch maps
    }
  }
}


// Search through the maps[] array to find the map with a given name, and
// retur the index into the array:
function findMapIndex(mapName) {
  for (var i=0; i<maps.length; i++) {
    if (maps[i].name == mapName) {
      return i;
    }
  }
  return -1;
}

// Draw all living enemies.
// Check if any enemies have died, and if so remove them from the map:
function drawEnemies() {
  for (var i=0; i<map.enemies.length; i++) {  // loop through all enemies
    if (map.enemies[i].health <= 0) {  // enemy has died...
      delete map.enemies[i];  // delete the given Enemy object
      map.enemies.splice(i,1);  // remove dead enemy (now undefined) from array
    }  
    else { 
      map.enemies[i].draw();
    };  // update enemy tile
  }
}

// Draw all portals that appear within the viewport
function drawPortals() {
  for (var i=0; i<map.portals.length; i++) {
    map.portals[i].draw();
  }
}


// Draw all boats that appear within the viewport
function drawBoats() {
  for (var i=0; i<map.boats.length; i++) {
    map.boats[i].draw();
  }
}


// Draw the weapon hit animation for all characters including enemies and players.
// When done, flip the character's hitFlag off to stop animation.
function drawHit(timestamp, character) {  // character can be an Enemy or Player
  var t = 150; // animation time (ms)
  if (!character.hitTime) { character.hitTime = timestamp; }
  var progress = timestamp - character.hitTime;
  if (progress < t) {
    var ri = offsetRows - (player.r - character.r);    // find tile position on canvas
    var ci = offsetCols - (player.c - character.c);
    // Animation consists of changing alpha value over time:
    drawColorTile(mapCanvas.context, ri, ci, 1.0-progress/t, "#00FF66");
  }
  else {  // animation over, reset relevant variables
    character.hitTime = 0;
    character.hitFlag = 0;  
  };
}


// Move player based on keyboard input, while restricting movement
// through terrain and preventing movement into enemies.
function movePlayer() {
  var newCol = wrapCol(player.c+moveCol); // check for wraping around map edges
  var newRow = wrapRow(player.r+moveRow);
  var ontoEnemyFlag = 0;

  // Check if player is moving onto a boat:
  for (var i=0; i<map.boats.length; i++) {  // Loop through all boats
    if (map.boats[i].r == newRow) {     // check r,c separately to save cycles
      if (map.boats[i].c == newCol) {   // Player is moving onto a boat
        player.boatIdx = i; 
      }
    }
  }

  // Check for movement onto an enemy:
  for (var i=0; i<map.enemies.length; i++) {  // loop through all enemies
    var enemy = map.enemies[i];
    if (newRow == enemy.r && newCol == enemy.c) { // make sure player does not move onto enemy
      ontoEnemyFlag = 1;    // about to move onto enemy, flip flag
    }
  }

  // Move player if terrain movement allows:
  if (Math.random() <= map.tiles[newRow][newCol].terrain.movement && !ontoEnemyFlag) {
    player.c = newCol;
    player.r = newRow;
    player.boatIdx = -1;  // in case player is moving off a boat
  }

  // Boat movement:
  else if (player.boatIdx > -1) {   // Player is on a boat
    if (map.tiles[newRow][newCol].terrain.name == "water") {  // boat is moving onto water
      player.c = newCol;  // move player...
      player.r = newRow;
      map.boats[player.boatIdx].r = newRow;  // ... and move boat too
      map.boats[player.boatIdx].c = newCol;
    }
  }

  moveCol = 0;  // Reset movement flags
  moveRow = 0;
  ontoEnemyFlag = 0;
}



function attack(enemies) {
  var ri = 0,
      ci = 0,
      enemy;

  if (player.weapon.moveCount == 0) {   // Start new shot at player location
    player.weapon.r = player.r;
    player.weapon.c = player.c; 
  }

  // Move shot in given direction until weapon range reached or enemy has been hit.
  // Also check terrain to stop shot from passing through solid terrain:
  if (player.weapon.moveCount++ < player.weapon.range &&
      !map.tiles[player.weapon.r][player.weapon.c].terrain.shotblock) {  
    
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
  else {  // Weapon has reached end of its range, so end attack w/o a hit
    attackReset()
  }

  // Enemy has been hit, so give damage and flip hitFlag to start the hit animation within loop()
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



function moveEnemies(enemies) {

  for (var i=0; i<enemies.length; i++) {  // loop through all enemies

    var enemy = enemies[i];

    if (enemy.movechance > Math.random()) {  // check if enemy will move

      var newRow = 0,
          newCol = 0;

      enemy.ro = enemy.r;  // save previous enemy position before moving
      enemy.co = enemy.c;

      var dr = player.r - enemy.r,  // deltas between player & monster
          dc = player.c - enemy.c;

      // remap dr & dc to always be less than half the map rows,cols:
      if (Math.abs(dr) > map.rows/2) { 
        dr = Math.sign(dr)*(Math.abs(dr) - map.rows);
      }
      else if (Math.abs(dc) > map.cols/2) { 
        dc = Math.sign(dc)*(Math.abs(dc) - map.cols);
      }

      // Only move if enemy is close enough to player:
      if (Math.pow(dr,2) + Math.pow(dc,2) < Math.pow(enemy.moveradius,2)) {

        // Determine movement toward player, taking wrapping around map edge into account.
        if (dr > 0 && dr < map.rows) { newRow = wrapRow(enemy.r + 1); }
        else if (dr < 0) { newRow = wrapRow(enemy.r - 1); } 
        if (dc > 0 && dc < map.cols) { newCol = wrapCol(enemy.c + 1); }
        else if (dc < 0) { newCol = wrapCol(enemy.c - 1); }
      }
      else {  // enemy doesn't "see" player, so move randomly (-1, 0, 1):
        newRow = wrapRow(enemy.r + Math.round(2*Math.random()-1));
        newCol = wrapCol(enemy.c + Math.round(2*Math.random()-1));
      }

      var colChance = dc/(dr+dc);   // chance of moving by column vs. row based on relative values
      var randNum = Math.random();  // random number to determine row or column movement

      var moved = 0; // flag used below
      if (randNum <= colChance) {  // try to move by column first
        moved = 1;
        if ( map.tiles[enemy.r][newCol].terrain.movement > 0) { enemy.c = newCol; }
        else if ( map.tiles[newRow][enemy.c].terrain.movement > 0 ) { enemy.r = newRow; }
        else { moved = 0; }  // no move by column has occurred
      }
      if (randNum > colChance || !moved) {  // try to move by row next
        moved = 1;
        if ( map.tiles[newRow][enemy.c].terrain.movement > 0 ) { enemy.r = newRow; }
        else if ( map.tiles[enemy.r][newCol].terrain.movement > 0) { enemy.c = newCol; }
        else { moved = 0; }  // no move by column has occurred
      }
      if (!moved) {  // movement toward player not possible...so try a random movement
        newRow = wrapRow(enemy.r + Math.round(2*Math.random()-1));
        newCol = wrapCol(enemy.c + Math.round(2*Math.random()-1));
        if ( map.tiles[newRow][enemy.c].terrain.movement > 0 ) { enemy.r = newRow; }
        else if ( map.tiles[enemy.r][newCol].terrain.movement > 0) { enemy.c = newCol; }
      }

      if ( (enemy.r == player.r) && (enemy.c == player.c) ) {  // enemy tried to move onto player (attack)
        enemy.r = enemy.ro;  // reset enemy to previous position
        enemy.c = enemy.co;
        player.health -= enemy.damage;  // enemy attacks player
        thud.play();
        player.hitFlag = 1;
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
      map.tiles[r][c].alpha = 1-checkHiding(ri,ci);
      drawSingleTile(mapCanvas.context, ri, ci, map.tiles[r][c].terrain.img);  // Draw the tile
      drawColorTile(maskCanvas.context, ri, ci, (1-map.tiles[r][c].alpha), "#000000");  // Add alpha
    }
  }
}


// Return the hiding level of a given tile:
function checkHiding(ri,ci) { 
  // ri,ci = indexed row,col position of target tile within viewport

  var dy = ri - offsetRows,  // map target tile coordinates relative to player location
      dx = ci - offsetCols,
      x, y, m,
      r, c;

  var hiding = 0;   // 1 = fully hiding, 0 = no hiding

  if (dx != 0) {
    m = dy / dx;  // slope of line from center to current tile

    // variables for adjusting hiding based on angle:
    var theta = Math.atan(Math.abs(m));
    var f = 0.8;  // scale factor (adjust as needed)

    if (Math.abs(m) <= 1) {  // |m| < 1 so check via y = m * x
      for (x = Math.sign(dx); Math.abs(x) < Math.abs(dx); x += Math.sign(dx)) {
        y = Math.round(m * x);
        r = wrapRow(player.r + y);
        c = wrapCol(player.c + x);
        hiding += map.tiles[r][c].terrain.hiding * (1+f*Math.sin(theta));  // include angle dependence
      }
    }
    else {  // |m| > 1 so check via x = (1/m) * y
      for (y = Math.sign(dy); Math.abs(y) < Math.abs(dy); y += Math.sign(dy)) {
        x = Math.round((1/m) * y);
        r = wrapRow(player.r + y);
        c = wrapCol(player.c + x);
        hiding += map.tiles[r][c].terrain.hiding * (1+f*Math.cos(theta)); // include angle dependence
      }
    }
  }
  else {  // dx == 0 so m = inf
    for (y = (Math.sign(dy)); Math.abs(y) < Math.abs(dy); y += Math.sign(dy)) {
        r = wrapRow(player.r + y);
        c = wrapCol(player.c);
        hiding += map.tiles[r][c].terrain.hiding;
    }
  }
  return (Math.min(hiding, 1));
}



// Wrap (r,c) coordinates across map boundaries.  Two functions are
// used to simplify function calls and reduce computational load.
function wrapRow(r) {
  if (r<0) { r += map.rows; }
  else if (r>=map.rows) { r -= map.rows; }
  return(r);
}
function wrapCol(c) {
  if (c<0) { c += map.cols; }
  else if (c>=map.cols) { c -= map.cols; }
  return(c);
}

