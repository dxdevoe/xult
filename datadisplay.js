
const statusBarLength = 100;
const statusBarWidth = 10;


function updateDataCanvas(timestamp) {
  dataCanvas.clear();
  healthBar.draw();
  foodBar.draw();

  showDevelopInfo();
  
  if (player.food <= 0) {
    foodBar.flash(timestamp);   // flash the food bar to alert player of hunger
  }
}



var healthBar = {
  draw : function() {
    ctx = dataCanvas.context;
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText("Health: " + player.health.toString() + " / " + player.maxhealth.toString(), 10, 10); 

    ctx.fillStyle = "black";
    ctx.fillRect(20, 20, statusBarLength, statusBarWidth);
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, statusBarLength*(player.health/player.maxhealth), statusBarWidth);
  }
}



var foodBar = {
  draw : function() {
    ctx = dataCanvas.context;
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText("Food: " + Math.ceil(player.food).toString() +  " / " + player.maxfood.toString(), 10, 50); 

    ctx.fillStyle = "black";
    ctx.fillRect(20, 60, statusBarLength, statusBarWidth);
    ctx.fillStyle = "blue";
    ctx.fillRect(20, 60, statusBarLength*(player.food/player.maxfood), statusBarWidth);
  },
  flash : function(timestamp) {
    var t = 2500; // animation time (ms)
    if (!foodBarAnimateTimestamp) {foodBarAnimateTimestamp = timestamp;}
    var progress = timestamp - foodBarAnimateTimestamp;
    if (progress < t) {
      ctx = dataCanvas.context;
      ctx.fillStyle = "red";
      ctx.globalAlpha = 1.0-progress/(2*t);
      ctx.fillRect(20, 60, statusBarLength, statusBarWidth);
    }
    else {foodBarAnimateTimestamp = 0;} // animation done, reset the timestamp
  }
}


function showDevelopInfo() {
  ctx = dataCanvas.context;
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("Row (Y): " + player.r + ", Col (X): " + player.c, 180, 20); 
  ctx.fillText("player.boatIdx: " + player.boatIdx, 180, 40); 
}

