var PlayScene = cc.Scene.extend({
	gameLayer: null,
	counter: null,
	ballsList: null,
	kinematicList: null,
	statusLayer: null,
	onEnter: function() {
		this._super();

		this.initPhysics();
		
		this.ballsList = {};

		this.kinematicList = [];

		this.statusLayer = new StatusLayer();

		this.animationLayer = new AnimationLayer(this.space, this, this.ballsList, this.kinematicList, this);
		
		this.gameLayer = new cc.Layer();
		this.gameLayer.addChild(new BackgroundLayer(), 0, tagOfLayer.background);
		this.gameLayer.addChild(this.animationLayer, 0, tagOfLayer.animation);
		this.addChild(this.gameLayer);
		
		this.addChild(this.statusLayer, 0, tagOfLayer.status);
		
		this.counter = 0;
	},
	increasePoints: function() {
		this.statusLayer.updatePoints();
	},
	initPhysics: function() {
        this.space = new cp.Space();
        
        this.space.gravity = cp.v(0, -600);
        this.scheduleUpdate();
    },
    removeSleepingBalls: function() {

		var that = this;

		for (var key in this.ballsList) {
			var ball = this.ballsList[key];

			if ( ball.getGroundTouch() > 3) {

				if ( !that.space.containsBody(ball.getBody())) {
					delete that.ballsList[key];
					continue;
				}

				delete that.ballsList[key];

				cc.log(this.ballsList);

				ball.getEmitter().stopSystem();

				that.space.removeBody(ball.getBody());

				// ball.getBody().eachShape(function (shape) {
				// 	that.space.removeShape(shape);
				// });

				//ball.getBody().eachShape(function (shape) {
				//	that.space.removeShape(shape);
				//});
				//that.space.removeBody(ball.getBody());

				//ball.removeFromParent(true);
				//ball.getEmitter().removeFromParent(true);

				var action = cc.sequence(
					cc.fadeOut(0.7), cc.removeSelf()
				);
				ball.runAction(action);
			}
		}

//    	for ( var i= 0; i< this.ballsList.length; i++) {
//    		var bbb = this.ballsList[i].body;
//
//    		var min = 50;
//
////    		cc.log(" vx : " + bbb.vx + "  vy " + bbb.vy);
//
//    		if ( Math.abs(bbb.vx) < min && Math.abs(bbb.vy) < min ) {
//
////    			this.ballsList[i].sprite.removeFromParent();
//
//    			this.space.removeShape(this.ballsList[i].shape);
//    			this.space.removeBody(this.ballsList[i].body);
//
//    			this.ballsList[i].sprite.removeFromParent(true);
//    			this.ballsList[i].emitter.removeFromParent(true);
//
//    			this.ballsList.splice(i,1);
//
//    			cc.log("remove ball!!");
//
//    		}
//    	}
    },
    update: function(dt) {
        this.space.step(dt);
        this.counter++;
        
        if ( this.counter === 25 ) {
        	this.counter = 0;
        	this.removeSleepingBalls();
        }

		for (var i  = 0;  i < this.kinematicList.length; i ++) {
			this.kinematicList[i].update(dt);
		}
        
        
    }

});