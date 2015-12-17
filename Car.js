// global namespace
var AiCarGame = AiCarGame || {};
AiCarGame.NextCarId = 0;

AiCarGame.Car = function(bitMap, carProperties) 
{
	this.carId = AiCarGame.NextCarId++;
	
	//car's fitness score, for now, it's the length of path the car drove
	this.fitness = 0;
	
	//car's position is decided by its center location and its angle
	this.centerLocation = {
		x:carProperties.startLocX, 
		y:carProperties.startLocY
	};
	
	this.angle = carProperties.angle;
	
	//the width and height of the car shape
	this.width = carProperties.width;
	this.height = carProperties.height;
	
	//detect radium should longer than the road width
	this.detectRadius = carProperties.detectRadius;
	this.detectEdgePoints = undefined;
	
	//if car hits the road and crash
	this.isOffRoad = false;
	
	
	this.rad2deg = 180/Math.PI;
	this.deg2rad = Math.PI/180;

	this.deltaGo = function()
	{
	 	//check if the car is off road.
	 	var checkDistOfCarBody = Math.sqrt(Math.pow(this.width/2,2) + Math.pow(this.height/2,2));
	 	var carRightUp = this.calculateDistance(this.angle - Math.atan(this.width/this.height) * this.rad2deg, checkDistOfCarBody);
	 	var carLeftUp = this.calculateDistance(this.angle + Math.atan(this.width/this.height) * this.rad2deg, checkDistOfCarBody);
	 	var carLeftBottom = this.calculateDistance(this.angle + 180 - Math.atan(this.width/this.height) * this.rad2deg, checkDistOfCarBody);
	 	var carRightBottom = this.calculateDistance(this.angle + 180 + Math.atan(this.width/this.height) * this.rad2deg, checkDistOfCarBody);

		this.isOffRoad = (carRightUp.length < checkDistOfCarBody) ||
						(carLeftUp.length < checkDistOfCarBody) ||
						(carLeftBottom.length < checkDistOfCarBody) ||
						(carRightBottom.length < checkDistOfCarBody);
		if(this.isOffRoad)
		{
			return;
		}
		
		//check if the 5 lines have overlap with off road.
	 	var rightDist = this.calculateDistance(this.angle-90,this.detectRadius);
	 	var rightUpDist = this.calculateDistance(this.angle-45,this.detectRadius);
	 	var upDist = this.calculateDistance(this.angle,this.detectRadius);
	 	var leftUpDist = this.calculateDistance(this.angle+45,this.detectRadius);
	 	var leftDist = this.calculateDistance(this.angle+90,this.detectRadius);
	 	
	 	this.detectEdgePoints = {
	 		right   : rightDist,
	 		rightUp : rightUpDist,
	 		up      : upDist,
	 		leftUp  : leftUpDist,
	 		left    : leftDist,
	 		carRightUp     : carRightUp,
	 		carLeftUp      : carLeftUp,
	 		carLeftBottom  : carLeftBottom,
	 		carRightBottom : carRightBottom
	 	};
	 	
	 	//5 lines, true is off road, false is on the road.
	 	var perceptronData = {
	 		right   : rightDist.length < this.detectRadius,
	 		rightUp : rightUpDist.length < this.detectRadius,
	 		up      : upDist.length < this.detectRadius,
	 		leftUp  : leftUpDist.length < this.detectRadius,
	 		left    : leftDist.length < this.detectRadius
	 	};
		
		this.fitness++;
		var direction = this.getMoveDirection(this.angle);
		this.centerLocation.x+=direction.x;
		this.centerLocation.y+=direction.y;
		//this.angle = this.angle%360-0.1;
		
		if(this.genome!=undefined)
		{
			var brainOutput = this.genome.neuralNet.update(perceptronData);
			//[0,1.0]==> [-10.0,+10.0]
			this.angle += brainOutput*20-10;
		}
		else
		{
			console.log("[Warning] Car "+this.carId+" doesn't have genome installed so it's going straight!!");
		}
	};
		
    //calculate 5 direction's distance to road
	this.calculateDistance = function(angle, radius)
	{
		var checkPoint = {
			xCheckPoint:this.centerLocation.x, 
			yCheckPoint:this.centerLocation.y
		};
		
		//TODO: if need to speed up, cal the point with angle and start point and detectRadius to see if off or on road.
		var linePoints = [{x:Math.round(checkPoint.xCheckPoint),y:Math.round(checkPoint.yCheckPoint)}];
		
		while(true)
		{
			//if the search goes beyond the scope, return the default length.
			if(Math.sqrt(Math.pow(checkPoint.xCheckPoint-this.centerLocation.x,2)+Math.pow(checkPoint.yCheckPoint-this.centerLocation.y,2)) >= radius)
			{
				//todo: remove finalpoint since onone using it.
				return {
							length     : this.detectRadius,
							linePoints : linePoints
						};
			}
			
			//if the checkpoint is already off road
			if(bitMap[Math.round(checkPoint.yCheckPoint)][Math.round(checkPoint.xCheckPoint)]==1)
			{
				return {
							length     : Math.sqrt(Math.pow(checkPoint.xCheckPoint-this.centerLocation.x,2)+Math.pow(checkPoint.yCheckPoint-this.centerLocation.y,2)),
							linePoints : linePoints
						};
			}
			
			this.updateSearchLoc(angle,checkPoint, linePoints);
		}
	};
	
	this.updateSearchLoc = function(angle, checkPoint, linePoints)
	{
		//const value for converting btn degree and ratio.
		angle = angle%360;
		if(angle<0)
		{
			angle+=360;
		}
		
		var ratio   = Math.tan( angle * this.deg2rad );
		//var degrees = Math.atan( ratio ) * this.rad2deg;
		if(angle<90 && angle>=0)
		{
			checkPoint.xCheckPoint+=0.5;
		    checkPoint.yCheckPoint = this.centerLocation.y - (checkPoint.xCheckPoint-this.centerLocation.x)*Math.abs(ratio);			
		}
		else if(angle==90)
		{
		    checkPoint.yCheckPoint--;			
		}
		else if(angle>90 && angle<=180)
		{
			checkPoint.xCheckPoint-=0.5;
		    checkPoint.yCheckPoint = this.centerLocation.y - (this.centerLocation.x-checkPoint.xCheckPoint)*Math.abs(ratio);			
		}
		else if(angle >180 && angle <270)
		{
			checkPoint.xCheckPoint-=0.1;
		    checkPoint.yCheckPoint = this.centerLocation.y + (this.centerLocation.x-checkPoint.xCheckPoint)*Math.abs(ratio);			
		}
		else if (angle==270)
		{
		    checkPoint.yCheckPoint++;			
		}
		else if(angle>270 && angle<360)
		{
			checkPoint.xCheckPoint+=0.5;
		    checkPoint.yCheckPoint = this.centerLocation.y + (checkPoint.xCheckPoint-this.centerLocation.x)*Math.abs(ratio);			
		}
		
		linePoints.push({x:Math.round(checkPoint.xCheckPoint),y:Math.round(checkPoint.yCheckPoint)});
	};
	
	this.getMoveDirection =function(angle)
	{
		angle = angle%360;
		if(angle<0)
		{
			angle+=360;
		}
		
		var xDelta=0;
		var yDelta=0;
		if(angle==90)
		{
			yDelta=-4;
		}
		else if(angle==270)
		{
			yDelta=4;
		}
		
		if(angle<90 && angle>=0)
		{
			var ratio = Math.tan(angle%90* this.deg2rad);
			xDelta = Math.sqrt(16/(1+Math.pow(ratio,2)));
			yDelta = -xDelta*ratio;
		}
		else if(angle>90 && angle<=180)
		{
			var ratio = Math.tan((90-angle%90)* this.deg2rad);
			xDelta = -Math.sqrt(16/(1+Math.pow(ratio,2)));
			yDelta = xDelta*ratio;
		}
		else if(angle >180 && angle <270)
		{
			var ratio = Math.tan(angle%90* this.deg2rad);
			xDelta = -Math.sqrt(16/(1+Math.pow(ratio,2)));
			yDelta = -xDelta*ratio;
		}
		else if(angle>270 && angle<360)
		{
			var ratio = Math.tan((90-angle%90)* this.deg2rad);
			xDelta = Math.sqrt(16/(1+Math.pow(ratio,2)));
			yDelta = xDelta*ratio;		
		}
		
		return {
			x:Math.round(xDelta),
			y:Math.round(yDelta)
		};
	};
};
