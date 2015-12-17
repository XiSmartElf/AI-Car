// global namespace
var AiCarGame = AiCarGame || {};

AiCarGame.GameModel = function(CarList)
{
	var originalCarList = CarList;
	var onGoingCarList = CarList;

    this.startGame = function(controller, isTrainMode, gameSpeed)
    {
        var move = setInterval(function(){deltaMove(move,controller,isTrainMode)},gameSpeed);
    }
    
    //Each car moves for one interval and exclude it if it's off road.
    var deltaMove = function(move,controller,isTrainMode)
    {
    	var onGoingCarList_New = [ ];
    	for(var car of onGoingCarList)
    	{
    	    car.deltaGo();
    	    if(!car.isOffRoad)
    	    {
    	        onGoingCarList_New.push(car);
    	        continue;
    	    }
    	}
    	
        onGoingCarList = onGoingCarList_New;
        if(onGoingCarList.length==0)
        {
            //if the current game is over, call back controller to inform the game is done.  
            clearInterval(move); 
            if(isTrainMode)
            {
                controller.nextRoundCallBack();
            }
        }
    };
};