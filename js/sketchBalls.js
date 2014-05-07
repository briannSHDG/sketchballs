var initialize = function(world){

    var viewWidth = $(window).width();
    var viewHeight = $(window).height();
    var gravityConstant = 0.0015;
    var ballsToCreate = 15;

    var renderer = Physics.renderer('canvas', {
        el: 'canvas',
        width: viewWidth,
        height: viewHeight,
        meta: false, // don't display meta data
        styles: {
            // set colors for the circle bodies
            'circle' : {
                strokeStyle: '#351024',
                lineWidth: 1,
                fillStyle: '#d33682',
                angleIndicator: '#351024'
            },

            'rectangle' : {
                fillStyle: '#d33682'
            }
        }
    });

    // add the renderer
    world.add( renderer );
    // render on each step
    world.on('step', function(){
        world.render();
    });

    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight - 200);

    // constrain objects to these bounds
    var edges = Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds,
        restitution: 0.80,
        cof: 0.99
    });
    world.add(edges);

    // add circles
    for (var i = 0; i < ballsToCreate; i++) {
        var image = new Image();
        image.src = 'img/ball1.png';
        world.add(
            Physics.body('circle', {
                x: viewWidth * Math.random(), // x-coordinate
                y: viewHeight * Math.random(), // y-coordinate
                vx: Math.random() / 4, // velocity in x-direction
                vy: Math.random() / 4, // velocity in y-direction
                radius: 40,
                view: image
            })
        );
    }

    var image = new Image();
    image.src = 'img/ball2.png';
    world.add(
        Physics.body('circle', {
            x: viewWidth * Math.random(), // x-coordinate
            y: viewHeight * Math.random(), // y-coordinate
            vx: Math.random() / 4, // velocity in x-direction
            vy: Math.random() / 4, // velocity in y-direction
            radius: 40,
            view: image
        })
    );

    var attractor = new Physics.behavior('attractor', {
        strength: -120
    });
    world.on({
        'interact:poke': function( pos ){
            attractor.position( pos );
            world.add( attractor );
        }
        ,'interact:move': function( pos ){
            attractor.position( pos );
        }
        ,'interact:release': function(){
            world.remove( attractor );
        }
    });

    $('#clearButton').click(function () {
        location.reload();
    });

    // ensure objects bounce when edge collision is detected
    world.add( Physics.behavior('body-impulse-response') );

    world.add( Physics.behavior('body-collision-detection') );
    world.add( Physics.behavior('sweep-prune') );

    // add some gravity
    var gravity = Physics.behavior('constant-acceleration', {
        acc: { x : 0, y: gravityConstant } // this is the default
    });
    world.add(gravity);

    // resize events
    window.addEventListener('resize', function () {

        viewWidth = $(window).width();
        viewHeight = $(window).height();

        renderer.el.width = viewWidth;
        renderer.el.height = viewHeight;

        viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight - 200);
        // update the boundaries
        edges.setAABB(viewportBounds);

    }, true);

    /*window.addEventListener('orientationchange', function () {
        world.remove(gravity);
        world.remove(renderer);

        var height = viewWidth;
        var width = viewHeight;

        if (window.orientation === -90) {
            gravity = Physics.behavior('constant-acceleration', {
                acc: { x : gravityConstant, y: 0 }
            })
            var temp = $('#canvas').css('height');
            $('#canvas').css('height', $('#canvas').css('width'))
            $('#canvas').css('width', temp)

        } else if (window.orientation === 90) {
            gravity = Physics.behavior('constant-acceleration', {
                acc: { x : -gravityConstant, y: 0 }
            })
            var temp = $('#canvas').css('height');
            $('#canvas').css('height', $('#canvas').css('width'))
            $('#canvas').css('width', temp)
        } else {
            // Treat as orientation === 0
            gravity = Physics.behavior('constant-acceleration', {
                acc: { x : 0, y: gravityConstant }
            })
            height = viewHeight;
            width = viewWidth ;
            var temp = $('#canvas').css('height');
            $('#canvas').css('height', $('#canvas').css('width'))
            $('#canvas').css('width', temp)
        }

        renderer = Physics.renderer('canvas', {
            el: 'canvas',
            width: width,
            height: height,
            meta: false, // don't display meta data
            styles: {
                // set colors for the circle bodies
                'circle' : {
                    strokeStyle: '#351024',
                    lineWidth: 1,
                    fillStyle: '#d33682',
                    angleIndicator: '#351024'
                }
            }
        });

        world.add(gravity);
        world.add(renderer);

        for (var i = 0; i < world.getBodies().length; i++) {
            var body = world.getBodies()[i];
            var temp = body.state.pos.x;
            body.state.pos.x = body.state.pos.y;
            body.state.pos.y = temp;
            body.recalc();
        }
    });*/


    var basketLeftWall = Physics.body('rectangle', {
        // place the centroid of the rectangle at (300, 200)
        x: 310,
        y: 320,
        width: 5,
        height: 150,
        treatment: 'static',
        restitution: 0.0
    });

    var basketRightWall = Physics.body('rectangle', {
        // place the centroid of the rectangle at (300, 200)
        x: 465,
        y: 320,
        width: 5,
        height: 150,
        treatment: 'static',
        restitution: 0.0
    });

    var basketBottomWall = Physics.body('rectangle', {
        // place the centroid of the rectangle at (300, 200)
        x: 385,
        y: 400,
        width: 150,
        height: 5,
        treatment: 'static',
        restitution: 0.5
    });

    world.add([basketLeftWall, basketRightWall, basketBottomWall]);

    world.add(Physics.behavior('interactive', { el: renderer.el }));

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time, dt ){
        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();

}

function lightsOut() {
    $('html').css('background-color', '#343639');
    $('#lightsOutButton').hide();
    $('#lightsOnButton').show();
}

function lightsOn() {
    $('html').css('background-color', 'white');
    $('#lightsOnButton').hide();
    $('#lightsOutButton').show();

}

Physics(initialize);

