if ( tagOfLayer === undefined ) {
	var tagOfLayer = {};
	tagOfLayer.background = 0;
	tagOfLayer.animation = 1;
	tagOfLayer.status = 2;
}

if ( layerOfSprite === undefined ) {
	var layerOfSprite = {};
	layerOfSprite.ball = 1;
	layerOfSprite.grade = 3;
	// layerOfSprite.sensor1 = 2;
	// layerOfSprite.sensor2 = 3;
	layerOfSprite.basket = 4;
	layerOfSprite.chain = 5;
	layerOfSprite.aro = 6;
	layerOfSprite.ground = 7;
}

if ( gameConstants === undefined ) {
    var gameConstants = {};
	gameConstants.ballsCount = 0;
}