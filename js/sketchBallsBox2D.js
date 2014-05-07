$('#initializeButton').click(function () {
    init();
});

function init() {


        // Initialize Buttons
        $('#addCircleButton').click(function () {
            addCircle();
        });


		// Define the canvas
		var canvaselem = document.getElementById("canvas");
		var context = canvaselem.getContext("2d");
		var canvaswidth = 100;
		var canvasheight = 100;

		// Define the world
		var gravity = new b2Vec2(0, -600);
		var doSleep = false;
		var world = new b2World(gravity, doSleep);
		var deletionBuffer = 4;
         
		//create ground
		var fixDef = new b2FixtureDef;
		fixDef.density = .5;
		fixDef.friction = 0.4;
		fixDef.restitution = 0.2;
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_staticBody;
		fixDef.shape = new b2PolygonShape;
		
		bodyDef.position.Set(canvaswidth, 0);
		fixDef.shape.SetAsBox(canvaswidth,1);
		world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		bodyDef.position.Set(canvaswidth, canvasheight);
		fixDef.shape.SetAsBox(canvaswidth,1);
		world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		bodyDef.position.Set(0, canvasheight);
		fixDef.shape.SetAsBox(1,canvasheight);
		world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		bodyDef.position.Set(canvaswidth, canvasheight);
		fixDef.shape.SetAsBox(1,canvasheight);
		world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		
	/*
   {x:theCanvas.width,y:0,w:theCanvas.width ,h:1}, //top
   {x:theCanvas.width,y:theCanvas.height,w:theCanvas.width ,h:1}, //bottom
   {x:0,y:theCanvas.height,w:1 ,h:theCanvas.height}, //left
   {x:theCanvas.width,y:theCanvas.height,w:1 ,h:theCanvas.height} //right
	*/

	 // The refresh rate of the display. Change the number to make it go faster
    z = window.setInterval(update2, (1000 / 60));

	 function addCircle() {
		 // create basic circle
         	 var bodyDef = new b2BodyDef;
		 var fixDef = new b2FixtureDef;
		 fixDef.density = .5;
		 fixDef.friction = 0.1;
		 fixDef.restitution = 0.2;
		 
		 var bodyDef = new b2BodyDef;
		 bodyDef.type = b2Body.b2_dynamicBody;
		 fixDef.shape = new b2CircleShape(2); //radius
		 bodyDef.position.x = canvaswidth;
		 bodyDef.position.y = canvasheight;
		 world.CreateBody(bodyDef).CreateFixture(fixDef);
	 }

	 // Update the world display and add new objects as appropriate
	 function update2() {
		world.Step(1 / 60, 10, 10);
		context.clearRect(0,0,canvaswidth,canvasheight);
	    	world.ClearForces();
	    
	    processObjects();
	 }

	 // Draw the updated display
	 // Also handle deletion of objects
	 function processObjects() {
		 var node = world.GetBodyList();
		 while (node) {
			var b = node;
			node = node.GetNext();
			// Destroy objects that have floated off the screen
			var position = b.GetPosition();
			if (position.x < -deletionBuffer || position.x >(canvaswidth+4)) {
				world.DestroyBody(b);
				continue;
		 	}

			// Draw the dynamic objects
			if (b.GetType() == b2Body.b2_dynamicBody) {

				// Canvas Y coordinates start at opposite location, so we flip
				var flipy = canvasheight - position.y;
				var fl = b.GetFixtureList();
				if (!fl) {
					continue;
				}
				var shape = fl.GetShape();
				var shapeType = shape.GetType();
				// put an image in place if we store it in user data
				if (b.m_userData && b.m_userData.imgsrc) {
					// This "image" body destroys polygons that it contacts
					var edge = b.GetContactList();
					while (edge)  {
						var other = edge.other;
						if (other.GetType() == b2Body.b2_dynamicBody) {
							var othershape = other.GetFixtureList().GetShape();
							if (othershape.GetType() == b2Shape.e_polygonShape) {
								world.DestroyBody(other);
								break;	
							 }
						 }
						 edge = edge.next;
					}

					// Draw the image on the object
					var size = b.m_userData.imgsize;
					var imgObj = new Image(size,size);
					imgObj.src = b.m_userData.imgsrc;
					context.save();
					// Translate to the center of the object, then flip and scale appropriately
					context.translate(position.x,flipy); 
					context.rotate(b.GetAngle());
					var s2 = -1*(size/2);
					var scale = b.m_userData.bodysize/-s2;
					context.scale(scale,scale);
					context.drawImage(imgObj,s2,s2);
					context.restore();
					//b.ApplyImpulse(new b2Vec2(6000,6000),new b2Vec2(0,0));
					//b.ApplyImpulse(new b2Vec2(6000,6000),b.GetWorldCenter());
					 
				 }

				 // draw a circle - a solid color, so we don't worry about rotation
				 else if (shapeType == b2Shape.e_circleShape) {
					context.strokeStyle = "#CCCCCC";
					context.fillStyle = "#FF8800";
					context.beginPath();
					context.arc(position.x,flipy,shape.GetRadius(),0,Math.PI*2,true);
					context.closePath();
					context.stroke();
					context.fill();
				 }

				 // draw a polygon 
				 else if (shapeType == b2Shape.e_polygonShape) {
					var vert = shape.GetVertices();
					context.beginPath();

					// Handle the possible rotation of the polygon and draw it
					b2Math.MulMV(b.m_xf.R,vert[0]);
					var tV = b2Math.AddVV(position, b2Math.MulMV(b.m_xf.R, vert[0]));
					context.moveTo(tV.x, canvasheight-tV.y);
					for (var i = 0; i < vert.length; i++) {
						var v = b2Math.AddVV(position, b2Math.MulMV(b.m_xf.R, vert[i]));
						context.lineTo(v.x, canvasheight - v.y);
					}
					context.lineTo(tV.x, canvasheight - tV.y);
					context.closePath();
					context.strokeStyle = "#CCCCCC";
					context.fillStyle = "#88FFAA";
					context.stroke();
					context.fill();

				}

			 }
		 }
	 }






	 
 
      };

