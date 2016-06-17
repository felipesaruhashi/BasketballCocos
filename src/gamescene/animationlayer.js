var AnimationLayer = cc.Layer.extend({
    maxDistance: 0,
    minDistance: 0,
    catapultPosition: null,
    fixedSpriteBall: null,
    ballsList: null,
    catapult: null,
    kinematicList: null,
    ctor: function(space, context, bl, klist) {
        var that = this;
        this.holdingFixedBall = false;
        this._super();
        this.space = space;

        this.kinematicList = klist;

        this.ballsList = bl; 
        
        this._context = context;

        //this.map = new cc.TMXTiledMap(res.basket_map);
        this.map = new cc.TMXTiledMap("res/basket_map.tmx");

        this.addChild(this.map);

        this._debugNode = new cc.PhysicsDebugNode(this.space);
        this.addChild(this._debugNode, 10);

        this.addScenario();
        this.initialization();
        this.initTarget();
        this.setupTouchListeners();

        return true;
    },
    addScenario: function() {
        var wallBottom = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 20),// start point
            cp.v(4000, 20),// MAX INT:4294967295
            0);// thickness of wall

        wallBottom.setElasticity(1);
        wallBottom.setFriction(0.8);

        wallBottom.setCollisionType(layerOfSprite.ground);

        this.space.addStaticShape(wallBottom);
    },
    addBall: function(pos) {
        var ball = new BallSprite(this,pos);

        this.ballsList[ball.getBody().count] = ball;

        return ball;
    },
    setupTouchListeners: function() {
        var that = this;

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function(touch, event) {
                var mousePosition = cp.v(touch.getLocationX(), touch.getLocationY());
                var ponto = cp.v(touch.getLocationX(), touch.getLocationY() );
                var catapultPoint = that.catapult.convertToWorldSpaceAR(cp.v(that.parent.x, that.parent.y));

                if( that.distanceBetweenShapes(catapultPoint, mousePosition) <30 ) {
                    that.holdingFixedBall = true;
                }
                return true;
            },
            onTouchMoved: function(touch, event) {
                var mousePosition = cp.v(touch.getLocationX(), touch.getLocationY());

                if (that.holdingFixedBall) {
                    var catapultPoint = cp.v(that.catapult.x, that.catapult.y);
                    var pullAreaPosition = catapultPoint;
                    if ( that.maxDistance >= that.distanceBetweenShapes(catapultPoint, mousePosition) ){
                        var ponto = mousePosition;
                    } else {

                        var result = cp.v(mousePosition.x - catapultPoint.x, mousePosition.y - catapultPoint.y);
                        var length = Math.sqrt(Math.pow(result.x,2) + Math.pow(result.y,2));
                        result = cp.v(result.x * (that.maxDistance/length), result.y * (that.maxDistance/length) );
                        var ponto = cp.v(result.x + catapultPoint.x, result.y + catapultPoint.y);
                    }

                    that.fixedSpriteBall.x = ponto.x;
                    that.fixedSpriteBall.y = ponto.y;
                }
            },
            onTouchEnded: function(touch, event) {
                if ( that.holdingFixedBall) {
                    var mousePosition = cp.v(touch.getLocationX(), touch.getLocationY());
                    var pullAreaPosition = that.catapultPosition;
                    var shotVect = cp.v( pullAreaPosition.x - mousePosition.x, pullAreaPosition.y - mousePosition.y );
                    var ballBody = that.addBall(cp.v(pullAreaPosition.x, pullAreaPosition.y));

                    ballBody.body.applyImpulse( cp.v(shotVect.x * 140, shotVect.y * 140), cp.v(shotVect.x, shotVect.y));
                    that.fixedSpriteBall.x = pullAreaPosition.x;
                    that.fixedSpriteBall.y = pullAreaPosition.y;
                    that.holdingFixedBall = false;
                }
            }

        }, this);
    },
    initialization: function() {
        this.space.addCollisionHandler(layerOfSprite.chain, layerOfSprite.ball,
            this.virtualCollisionBallBasket.bind(this), null, null, null);

        this.space.addCollisionHandler(layerOfSprite.ground, layerOfSprite.ball,
            this.ballGroundCollisionHandler.bind(this), null, null, null);

        var group = this.map.getObjectGroup("Shotter");
        var array = group.getObjects();
        var obj = array[0];

        var catapultPos = cp.v(obj["x"], obj["y"]);

        this.maxDistance = 100;
        this.minDistance = 60;

        var winSize = cc.winSize;

        this.catapult = new cc.Sprite(res.catapult_png);
        this.catapult.setAnchorPoint(cp.v(0.5, 0.9))
        this.catapult.attr( catapultPos );

        this.addChild(this.catapult);

        this.fixedSpriteBall = new cc.Sprite(res.ball_png);
        this.fixedSpriteBall.attr( catapultPos );

        this.addChild(this.fixedSpriteBall);
        this.catapultPosition = catapultPos;
    },
    readMap: function(array) {

    	var actions = [];

    	if ( array.length > 1) {
    		for ( var i = 1; i < array.length; i++) {
    			var bla = array[i];
    			var time = bla["time"];
    			actions.push(cc.MoveTo.create(Number(time), cp.v(bla["x"], bla["y"])));
    		}

    		bla = array[0];
    		time = bla["time"];
    		actions.push(cc.MoveTo.create(Number(time), cp.v(bla["x"], bla["y"])));

    	}

    	return actions;
    },
    initTarget: function() {
        var that = this;

        var group = this.map.getObjectGroup("Basket");
        var array = group.getObjects();
        var obj = array[0];

        var squirepos = cp.v(obj["x"], obj["y"]);

        var squire = Squire.create({
        	image : res.tabela_png,
        	pos : squirepos,
        	space : this.space,
        	context: this
        });

        var act = this.readMap(array);

        if ( act.length > 1) {
        	var sequence = cc.Sequence.create.apply(cc.Sequence, act);
	        var forEver = cc.RepeatForever.create(sequence);
	        squire.suporte.runAction(forEver);
        }

        var groupObstacle = this.map.getObjectGroup("Obstacle");
        var arrayObstacle = groupObstacle.getObjects();
        var init = arrayObstacle[0];

        var testePos = cp.v(init["x"], init["y"]);

        var obstacle = Obstacle.create({
        	image : res.obstacule_png,
        	pos : testePos,
        	space : this.space,
        	context: this
        });


        this.kinematicList.push(obstacle.sprite);

        var actObstacle = this.readMap(arrayObstacle);

        cc.log(actObstacle);

        if ( actObstacle.length > 1) {
        	var sequence2 = cc.Sequence.create.apply(cc.Sequence, actObstacle);
        	var forEver2 = cc.RepeatForever.create(sequence2);
        	obstacle.sprite.runAction(forEver2);
        }

    },
    distanceBetweenShapes:function(pos1, pos2) {
        var x1 = pos1.x;
        var y1 = pos1.y;

        var x2 = pos2.x;
        var y2 = pos2.y;

        var d = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        return d;
    },
    normalizeVector: function(vect) {
        var length = vectLength(vect);
        var result = cp.v(vect.x/length, vect.y/length);

        return result;
    },
    vectLength: function(vect) {
        return Math.sqrt(Math.pow(vect.x,2) + Math.pow(vect.y,2));
    },
    ballGroundCollisionHandler: function(arbiter, space) {
        // dont work on ios
        //var shapeA = arbiter.getA();
        //var shapeB = arbiter.getB();

        //var bodies = arbiter.getBodies();
        //
        //
        //var body;
        //if (shapeA.collision_type === layerOfSprite.ball) {
        //    body = shapeA.getBody();
        //} else {
        //    body = shapeB.getBody();
        //}
        //
        //
        //if (this.ballsList[body.count] != undefined) {
        //    this.ballsList[body.count].touchTheGround();
        //}

        return true;
    },
    virtualCollisionBallBasket: function( arbiter, space) {
        var shapes = arbiter.getShapes();

        // var shapeA = arbiter.getA();
        // var shapeB = arbiter.getB();
        //var bolaShape = shapes[1];
        //var cestaBolaShape = shapes[0];

        // if ( shapeA.collision_type === layerOfSprite.ball ) {
        //     bolaShape = shapeA;
        //     cestaBolaShape = shapeB;
        // } else {
        //     bolaShape = shapeB;
        //     cestaBolaShape = shapeA;
        // }

        //var vel = bolaShape.getBody().getVel();
        //cestaBolaShape.getBody().applyImpulse(cp.v(vel.y, vel.y ), cp.v(0, 0));

        return true;
    }
});