var Obstacle = cc.PhysicsSprite.extend({
	ctor:function(image){
		this._super(image);
	},
	_syncPosition: function() {
		this._super();

		this.shape.cacheBB();
		this.space.reindexShape(this.shape);
	},
	setShape: function(shape) {
		this.shape = shape;
	},
	setSpace: function(space) {
		this.space = space;
	}
});

Obstacle.create = function(args) {

	var obstacle = new Obstacle(args.image);
	
//	var body = new cp.Body(60, cp.momentForBox(20, 40, 90)/8);
	var body = new cp.StaticBody();
	
	var shape = new cp.BoxShape(body, 
			obstacle.getContentSize().width, obstacle.getContentSize().height);
	args.space.addShape(shape);
//	args.space.addBody(body);
	
	body.setPos(args.pos);
	
	obstacle.setBody(body);
	obstacle.setShape(shape);
	obstacle.setSpace(args.space);
	obstacle.setShape(shape);

	args.context.addChild(obstacle);
	
	
	return {
		sprite : obstacle,
		body: body,
		shape: shape
	};
	
};