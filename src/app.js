var SPLASH_INITIALIZE = false;

var SplashLayer = cc.Layer.extend({
    splashSprite:null,
    ctor:function () {
        this._super();

        var size = cc.winSize;

        // add "HelloWorld" splash screen"
        this.splashSprite = new cc.Sprite(res.splash_png);
        this.splashSprite.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 0.5,
            opacity: 0
        });
        this.addChild(this.splashSprite, 0);


        this.splashSprite.runAction(
            cc.sequence(
                cc.fadeIn(1.7),
                cc.fadeOut(1.7),
                cc.callFunc(function() {
                    var scene = new MenuScene();
                    cc.director.runScene(scene);
                }, this)
            )
        );
        
        return true;
    }
});

var SplashScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        if ( SPLASH_INITIALIZE === false) {

            SPLASH_INITIALIZE = true;
            var layer = new SplashLayer();
            this.addChild(layer);
        }
    }
});

