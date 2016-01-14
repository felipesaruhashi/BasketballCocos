var MENU_INITIALIZE = false;


var MenuLayer = cc.Layer.extend({
    splashSprite:null,
    ctor:function () {
        this._super();

        var size = cc.winSize;


        var menuItem1 = new cc.MenuItemFont("Play", this.play);
        var setting = new cc.MenuItemFont("Settings");
        var menu = new cc.Menu(menuItem1, setting);
        menu.alignItemsVertically();
        this.addChild(menu);
        
        return true;
    },
    play: function() {
        //TODO Play Scene
        // cc.director.pushScene(scene);

        var scene = new PlayScene();
        cc.director.runScene(scene);
    }
});

var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        if ( MENU_INITIALIZE  === false ) {
            MENU_INITIALIZE = true;
            var layer = new MenuLayer();
            this.addChild(layer);

        }
    }
});

