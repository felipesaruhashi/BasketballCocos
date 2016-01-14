
var Teste = cc.PhysicsSprite.extend({
	ctor:function(arg){
		this._super(arg.image);
		cc.log("ctor sprite");
	},
	_syncPosition: function() {
		this._super();

		this.shape.cacheBB();
		this.space.reindexShape(this.shape);
	},setShape: function(shape) {
		this.shape = shape;
	}, setSpace: function(space) {
		this.space = space;
	}
});

Teste.create = function(arg) {
	var teste = new Teste(arg);

	return teste;
}