window.onkeydown = function(e){
	var key = e.which;
	switch(key){
		case 37:
			moveLeft();
			break;
		case 38:
			moveRight();
			break;
		case 39:
			moveUp();
			break;
		case 40:
			moveDown();
			break;
	}
}