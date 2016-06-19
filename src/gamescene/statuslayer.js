var StatusLayer = cc.Layer.extend({
	labelPoints:null,
    
    points:null,
	ctor: function() {
		this._super();
		this._init();
	},
	_init: function() {

		var winsize = cc.director.getWinSize();

		this.points = 0;

        this.labelPoints = new cc.LabelTTF("Points:0", "Helvetica", 20);
        this.labelPoints.setColor(cc.color(255,255,255));//black color
        this.labelPoints.setPosition(cc.p(70, winsize.height - 20));
        this.addChild(this.labelPoints);


	},

	updatePoints: function() {
		this.points++;
		this.labelPoints.setString("Points:" + this.points);

	}

});