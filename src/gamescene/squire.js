var Squire = cc.PhysicsSprite.extend({
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


var addHub = function(context, aro, basketPosition) {

	var addChain = function(pos) {
            var mass = 2;
            var chainBody = context.space.addBody(new cp.Body(mass, cp.momentForBox(mass, 40, 90)/90));

            chainBody.setPos(pos);

            var spriteChain = new cc.PhysicsSprite(res.chain2_png);
            var contentSize = spriteChain.getContentSize();
            

            contents = contentSize;
            spriteChain.setBody(chainBody);
            var chainShape = new cp.BoxShape(chainBody, contentSize.width,contentSize.height);
            chainShape.layers = layerOfSprite.ball;
            chainShape.setSensor(true);
            chainShape.setCollisionType(layerOfSprite.chain);
            context.space.addShape(chainShape);
            context.addChild(spriteChain);

            // return chainBody;
            return {
                shape: chainShape,
                sprite: spriteChain,
                body: chainBody
            };
        };

	var maxWidth = 4;
	var maxHeight = 3;

	var container = [];

	var previousChain;

        for ( i=0; i <maxWidth; i ++) {

            for (j=0; j < maxHeight; j++) {

                chain = addChain(basketPosition);

                div = (aro.sprite.getContentSize().width - chain.sprite.getContentSize().width )/4;

                if ( i < 2 ) chainMoreInCenter = chain.sprite.getContentSize().width/4 * j;
                else chainMoreInCenter = -chain.sprite.getContentSize().width/4 * j;

                posChain = cp.v.add(basketPosition, 
                cp.v( -aro.sprite.getContentSize().width/2.5 + chain.sprite.getContentSize().width/2 + div * i 
                    // + chainMoreInCenter
                    , 
                    -aro.sprite.getContentSize().height/2 - chain.sprite.getContentSize().height/2 
                    - chain.sprite.getContentSize().height * j * 1.1
                    ));

                chain.body.setPos(posChain);

                if ( previousChain === undefined) {

                    context.space.addConstraint(new cp.PinJoint(aro.body, chain.body, 
                        cp.v( -aro.sprite.getContentSize().width/2.5 + chain.sprite.getContentSize().width/2 + div * i, 
                            -aro.sprite.getContentSize().height/2), 
                        cp.v(0,chain.sprite.getContentSize().height/2)));
                } else {

                    context.space.addConstraint(new cp.PinJoint(previousChain.body, chain.body, 
                        cp.v(0, - previousChain.sprite.getContentSize().height/2), 
                        cp.v(0,previousChain.sprite.getContentSize().height/2)));

                }

                previousChain = chain;
            }

            container.push(chain);

            previousChain = undefined;
        }

        for (i=0; i<4; i++) {

            if ( previousChain != undefined && container[i] != undefined) {
                context.space.addConstraint(new cp.PinJoint(previousChain.body, container[i].body, 
                    cp.v(previousChain.sprite.getContentSize().width/2, 
                        -previousChain.sprite.getContentSize().height/2), 
                    cp.v(-previousChain.sprite.getContentSize().width/2,
                        -previousChain.sprite.getContentSize().height/2)));
            }

            previousChain = container[i];
        }
        
};

Squire.create = function(args) {
	
	
	var squire = new Squire(args.image);
	var suporteBody = new cp.StaticBody();
	var suporteShape = new cp.BoxShape(suporteBody, 
			squire.getContentSize().width,squire.getContentSize().height);
	
	squire.setShape(suporteShape);
	args.space.addShape(suporteShape);
	suporteShape.setElasticity(0.6);
	suporteShape.setFriction(0.5);
	suporteShape.setSensor(true);
	var body = new cp.Body(60, cp.momentForBox(20, 40, 90)/8);	
	squire.setBody(body);
	squire.setSpace(args.space);
	body.setPos(args.pos);
	args.space.addBody(body);
	var shape = new cp.BoxShape(body, squire.getContentSize().width, 
			squire.getContentSize().height);
	shape.setCollisionType(layerOfSprite.chain);
	args.space.addShape(shape);
	args.context.addChild(squire);
	
    var suporteSprite = new cc.PhysicsSprite(res.tabela_png);
	suporteSprite.setBody(suporteBody);
	suporteSprite.setAnchorPoint(cc.p(0, 0.5));	
	args.context.addChild(suporteSprite);
	
	suporteSprite.setVisible(false);

	suporteBody.setPos(cp.v.add(args.pos, cp.v(squire.getContentSize().width*0.0, 0)));


	args.space.addConstraint(new cp.PivotJoint(body, suporteBody, 
                        cp.v(0, squire.getContentSize().height/2), 
                        cp.v(0,squire.getContentSize().height/2)));

	args.space.addConstraint(new cp.PivotJoint(body, suporteBody, 
                        cp.v(0, squire.getContentSize().height/4), 
                        cp.v(0,squire.getContentSize().height/4)));


	args.space.addConstraint(new cp.PivotJoint(body, suporteBody, 
                        cp.v(0, 0), 
                        cp.v(0, 0)));

	args.space.addConstraint(new cp.PivotJoint(body, suporteBody, 
                        cp.v(0, -squire.getContentSize().height/2), 
                        cp.v(0, -squire.getContentSize().height/2)));


	var wasFromUp;

	var distancesMap = new Map();
	var dealWithPointBegin = function(arbiter, space) {

		var shapes = arbiter.getShapes();
        var bolaShape = shapes[1];
        var aroShape = shapes[0];

        var diffAltura = bolaShape.getBody().getPos().y - aroShape.getBody().getPos().y;

        if ( diffAltura > 0 ) 
        	distancesMap.set(bolaShape.hashid, Infinity);
		return true;
	};

	var dealWithPointPreSolve = function(arbiter, space) {

		var shapes = arbiter.getShapes();
        var bolaShape = shapes[1];
        var aroShape = shapes[0];

        if ( distancesMap.has(bolaShape.hashid)) {
			var distance = Math.floor(cp.v.dist(bolaShape.getBody().getPos(), aroShape.getBody().getPos()));

			if ( distance < distancesMap.get(bolaShape.hashid)) {
				distancesMap.set(bolaShape.hashid, distance);
			}
		}
		return true;
	};

	var dealWithPointSeparateSolve = function(arbiter, space) {
		var shapes = arbiter.getShapes();
        var bolaShape = shapes[1];
        var aroShape = shapes[0];
        if ( distancesMap.has(bolaShape.hashid) ) {
			var minorDistance = distancesMap.get(bolaShape.hashid);
			var diffAltura = bolaShape.getBody().getPos().y - aroShape.getBody().getPos().y;

			if ( diffAltura < 0 && minorDistance < bolaShape.r ) {
				cc.log("PPPPPoooonto!!!!!!!");
                args.playScene.increasePoints();
			}
			distancesMap.delete(bolaShape.hashid);
		}

		return true;
	};

	var addAro = function(pos, squire, squirebody) {

            var spriteAro = new cc.PhysicsSprite(res.aro_png);
            var bodyAro = new cp.Body(70, cp.momentForBox(50, 40, 90)/10);

            //begin, preSolve, postSolve, separate
            var shapeAro = new cp.BoxShape(bodyAro, spriteAro.getContentSize().width, 
						spriteAro.getContentSize().height);

            args.space.addCollisionHandler(layerOfSprite.aro, layerOfSprite.ball,
            	dealWithPointBegin.bind(this), 
            	dealWithPointPreSolve.bind(this), 
            	null, 
            	dealWithPointSeparateSolve.bind(this)); 

            var position = cp.v.add(
            		pos, 
            			cp.v(-spriteAro.getContentSize().width/2 -squire.getContentSize().width, 
            				-squire.getContentSize().height/3	
            			)
            	);

            bodyAro.setPos(position);
            spriteAro.setBody(bodyAro);
            var shapeAro = new cp.BoxShape(bodyAro, spriteAro.getContentSize().width, spriteAro.getContentSize().height);

            args.space.addShape(shapeAro);
            args.space.addBody(bodyAro);
            args.context.addChild(spriteAro);

            shapeAro.setSensor(true);
            shapeAro.setCollisionType(layerOfSprite.aro);

            args.space.addConstraint(new cp.PinJoint(bodyAro, squirebody, 
                        cp.v(-spriteAro.getContentSize().width/2, 0), 
                        cp.v(0, squire.getContentSize().height/2)));

            args.space.addConstraint(new cp.PinJoint(bodyAro, squirebody, 
                        cp.v(-spriteAro.getContentSize().width/2, 0), 
                        cp.v(0, -squire.getContentSize().height/2)));

            args.space.addConstraint(new cp.PinJoint(bodyAro, squirebody, 
                        cp.v(spriteAro.getContentSize().width/2, 0), 
                        cp.v(0, squire.getContentSize().height/2)));

            args.space.addConstraint(new cp.PinJoint(bodyAro, squirebody, 
                        cp.v(spriteAro.getContentSize().width/2, 0), 
                        cp.v(0, -squire.getContentSize().height/2)));


            args.space.addConstraint(new cp.PinJoint(bodyAro, squirebody, 
                        cp.v(0, 0), 
                        cp.v(0, 0)));

            return {
                shape: shapeAro,
                sprite: spriteAro,
                body: bodyAro,
                pos: position
            };
        };

    var addQuina = function(pos, width, height, aro, lado, space) {

            var bodyQuina = new cp.Body(10, cp.momentForBox(40, 15, 15)/10);
            var shapeQuina = new cp.BoxShape(bodyQuina, width, height);
            shapeQuina.setFriction(1);
            shapeQuina.setElasticity(0.5)
            
            bodyQuina.setPos(pos);

            space.addShape(shapeQuina);
            space.addBody(bodyQuina);

            space.addConstraint
            (   new cp.PivotJoint
                (
                    bodyQuina, 
                    aro.body, 
                    
                    cp.v(0,-aro.sprite.getContentSize().height/2),
                    cp.v( lado*aro.sprite.getContentSize().width/2 ,-aro.sprite.getContentSize().height/2)
                )
            );

            space.addConstraint
            (   new cp.PivotJoint
                (
                    bodyQuina, 
                    aro.body, 
                    
                    cp.v(0,aro.sprite.getContentSize().height/2),
                    cp.v( lado*aro.sprite.getContentSize().width/2,aro.sprite.getContentSize().height/2)
                )
            );

            return {
                body: bodyQuina,
                shape: shapeQuina
            };
        };

    var aro = addAro(args.pos, squire, body);

    var quinaWidth = aro.sprite.getContentSize().width/10;

    var quina1 = addQuina( cp.v.add(aro.pos, 
        cp.v(-aro.sprite.getContentSize().width/2 , 0)), 
        quinaWidth, aro.sprite.getContentSize().height, aro, -1, args.space);

    // var quina2 = addQuina( cp.v.add(aro.pos, 
    //     cp.v(aro.sprite.getContentSize().width/2 , 0), aro.body), 
    //     quinaWidth, aro.sprite.getContentSize().height, aro, 1, args.space);


    addHub(args.context, aro, aro.pos );

	return {
		sprite : squire,
		body: body,
		shape: shape,
		suporte : suporteSprite
	};
}