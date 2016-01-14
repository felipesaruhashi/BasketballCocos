/**
 * Created by felipesaruhashi on 29/12/15.
 */
var BallSprite = cc.PhysicsSprite.extend({
    groundTouch: 0,
    emitter: null,
    ctor:function(context, pos){
        this._super(res.ball_png);

        var body = context.space.addBody(new cp.Body(15, cp.momentForBox(15, 15, 15)));
        body.setPos(pos);

        gameConstants.ballsCount++;
        body.count = gameConstants.ballsCount;
        this.setBody(body);

        this.zIndex = -1;

        context.addChild(this);

        var contentSize = this.getContentSize();

        var ballShape = new cp.CircleShape(body, contentSize.width/2, cp.v(0,0));
        ballShape.setCollisionType(layerOfSprite.ball);
        ballShape.layers = layerOfSprite.ball;
        //context.addChild(ballShape);
        ballShape.setElasticity(0.9);
        ballShape.setFriction(0.5);

        context.space.addShape(ballShape);

        var _emitter = new cc.ParticleSystem("res/particles/fireball.plist");
        _emitter.setPositionType(cc.ParticleSystem.TYPE_RELATIVE);

        this.emitter = _emitter;
        context.addChild(_emitter);
        this.setParticle(_emitter);

    },
    _syncPosition: function() {
        this._super();

        if ( this.particle != undefined) {
            this.particle.x = this.x;
            this.particle.y = this.y;
        }

    },
    setParticle: function(particle) {
        this.particle = particle;
    },
    touchTheGround: function (){
        this.groundTouch++;
    },
    getGroundTouch: function() {
        return this.groundTouch;
    },
    getEmitter: function() {
        return this.emitter;
    }


});