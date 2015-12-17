//Training Script.
// global namespace
var AiCarGame = AiCarGame || {};
var canvas;
var ctx;
var controller = undefined;
//Acquire the UI required drawing data from controller.
var roadImage = new Image();
var carImg;
var imgWidth;
var imgHeight;
var curRoadImgSrc;
var NeedBitMap = true;

//********Setup at the beginning********************
window.onload = function(){
    canvas =  document.getElementById("canvas");
	ctx = canvas.getContext("2d");
};


roadImage.onload = function()
{
    imgWidth = roadImage.width;
    imgHeight = roadImage.height;
};


//**********user clicks and then go,this is where the game begins**********
function train(){ 
    //define a game flow controller but doesn't kick off the games.
    controller = new AiCarGame.FlowController();
    //update the UI required drawing data of cars every 1000 ms.
    var graph = setInterval(function(){GetBitMapForTrainning(graph)}, 1000);
}

/*
Update UI on a timely basis. 
*/
function GetBitMapForTrainning(graph)
{
    console.log("[Train] Initializing trainning....");
    //clear UI before redraw the items.
    ctx.clearRect(0,0,canvas.width, canvas.height);
    //if FlowController is defined/inited, start drawing.
    if(controller!=undefined)
    {
        var drawData = controller.drawInfo_to_UI_layer();
        //set the road & car image src to display
        if(curRoadImgSrc ==undefined || curRoadImgSrc != drawData.roadImgSrc)
        {
            curRoadImgSrc = drawData.roadImgSrc;
            roadImage.src = drawData.roadImgSrc;
            carImg = new Image();
            carImg.src = "Images/car.png";
            NeedBitMap = true;
        }
        
        //once image is loaded, get the bitmap for game use and kick off the games.
        if(roadImage.complete && NeedBitMap == true)
        {
            //print the road map one time here and get its data for creating road bit map.
            ctx.drawImage(roadImage,0,0);
            var imgPixels = ctx.getImageData(0, 0, imgWidth, imgHeight);
            
            var roadBitMap = new Array(imgPixels.height);
            for (var m = 0; m < roadBitMap.length; m++) 
            {
              roadBitMap[m] = new Array(imgPixels.width);
            }
            
            //convert the RGB image to binary image (2d array with 0,1) for game.
            for(var y = 0; y < imgPixels.height; y++)
            {
                for(var x = 0; x < imgPixels.width; x++)
                {
                  var i = (y * imgPixels.width + x) * 4;
                  var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                  if(avg > 90)
                  {
                    //white
                    roadBitMap[y][x]=1;
                  }
                  else
                  {
                    //black
                    roadBitMap[y][x]=0;
                  }
                }
            }
            
            //assign flowController the current Road bitmap for it to use for game.
            //now controller has the road map (binary) so it can start the games using current map.
            controller.roadBitMap = roadBitMap;
            console.log("[Train] training begins.....");
            controller.CycleBegins(true);
            NeedBitMap = false;
            clearInterval(graph);
            ctx.clearRect(0,0,canvas.width, canvas.height);
            ctx = null;
            canvas = null;
            
            var e = document.body;
            e.parentNode.removeChild(e);
        }
    }
}

 

