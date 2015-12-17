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
var roadBitMap_temp = undefined;
var isTrainMode = undefined;

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
function init(mode, speed){ 
    document.getElementById("ShowCaseSlow").disabled = true;
    document.getElementById("ShowCaseFast").disabled = true;
    document.getElementById("Training").disabled = true;
    isTrainMode = mode;
    //define a game flow controller but doesn't kick off the games.
    controller = new AiCarGame.FlowController();
    controller.gameSpeed = speed;
    
    //update the UI required drawing data of cars every 1000 ms.
    setInterval(UI_update, 50);
}

/*
Update UI on a timely basis. 
*/
function UI_update()
{
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
            controller.CycleBegins(isTrainMode);
            NeedBitMap = false;
            roadBitMap_temp = roadBitMap;
        }
        
        //draw the background exactly same as the loaded picture src.
        ctx.drawImage(roadImage,0,0);
        if(isTrainMode)
        {
            drawText(10,15,"Generation: "+controller.gaCar.iGeneration);
            drawText(10,30,"Last Generation Best Fitness Score: "+controller.gaCar.bestFitnessScore);
            controller.gaCar.setHistoryBest();
            drawText(10,45,"Curren Best Fitness Score: " + controller.gaCar.bestFitnessScoreSoFar);
        }
        // carImg.width = 10;
        // carImg.height = 20;
        // ctx.drawImage(carImg,300,100,10,20);
        // if(roadBitMap_temp!=undefined)
        // {
        //     var imgData=ctx.createImageData(roadBitMap_temp[0].length,roadBitMap_temp.length);
        //     for (var i=0;i<imgData.data.length;i+=4)
        //       {
        //           var index= i/4;
        //           var row = Math.floor(index/roadBitMap_temp[0].length);
        //           var column = index%roadBitMap_temp[0].length;
        //           var data;
        //           if(roadBitMap_temp[row][column]==0)
        //             data = 0;
        //           else
        //             data = 255;
                    
        //           imgData.data[i+0]=0;
        //           imgData.data[i+1]=data;
        //           imgData.data[i+2]=0;
        //           imgData.data[i+3]=255;
        //       }
        
        //     ctx.putImageData(imgData,0,0);
        // }
        
        if(drawData.listOfCars!=undefined)
        {
            //draw cars here from the list one by one.
            for(var car of drawData.listOfCars)
            {
                drawCar(car);
            }
        }
    }
}


function drawCar(car)
{
    if(carImg == undefined)
    {
        return;
    }
    
    if(carImg.complete)
    {
        var centerLocation = car.centerLocation;
        var edges = car.detectEdgePoints;
        if(edges!=undefined && isTrainMode==false)
        {
            for(var point of edges.right.linePoints)
            {
                drawDotRed(point.x,point.y);
            }
            
            for(var point of edges.rightUp.linePoints)
            {
                drawDotRed(point.x,point.y);
            }
            
            for(var point of edges.up.linePoints)
            {
                drawDotRed(point.x,point.y);
            }
            
            for(var point of edges.leftUp.linePoints)
            {
                drawDotRed(point.x,point.y);
            }
            
            for(var point of edges.left.linePoints)
            {
                drawDotRed(point.x,point.y);
            }
            
            drawCircle(centerLocation.x,centerLocation.y);
            drawText(10,30,"This car's Fitness Score: "+ car.fitness);
        }
        
        //conversion
        var angle = 90-car.angle;//360-(car.angle+90);
        carImg.width = car.width;
        carImg.height = car.height;
        
        var width = carImg.width;
        var height = carImg.height;
        
        //Convert degrees to radian 
        var rad = angle * Math.PI / 180;

        //Set the origin to the center of the image
        ctx.translate(centerLocation.x, centerLocation.y);
    
        //Rotate the canvas around the origin
        ctx.rotate(rad);
    
        //draw the image    
        ctx.drawImage(carImg, width / 2 * (-1), height / 2 * (-1), width, height);
    
        //reset the canvas  
        ctx.rotate(rad * ( -1 ) );
        ctx.translate((centerLocation.x) * (-1), (centerLocation.y) * (-1));
        
        //draw the corner lines to see if car is off road.
        // if(edges!=undefined && isTrainMode==false)
        // {
        //     for(var point of edges.carLeftUp.linePoints)
        //     {
        //         drawDotYellow(point.x,point.y);
        //     }
            
        //     for(var point of edges.carRightUp.linePoints)
        //     {
        //         drawDotYellow(point.x,point.y);
        //     }
            
        //     for(var point of edges.carRightBottom.linePoints)
        //     {
        //         drawDotYellow(point.x,point.y);
        //     }
            
        //     for(var point of edges.carLeftBottom.linePoints)
        //     {
        //         drawDotYellow(point.x,point.y);
        //     }
        // }
    }
}
 
//Draw Helper   
function drawCircle(x,y)
{
      var radius =30;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      //ctx.fillStyle = 'green';
      //ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#003300';
      ctx.stroke();
}

function drawDotRed(x,y)
{
      var radius =0.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FF0000';
      ctx.stroke(); 
}

function drawDotYellow(x,y)
{
      var radius =0.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFF00';
      ctx.stroke(); 
}


function drawLine(start,end)
{
    ctx.beginPath();
    ctx.moveTo(end.x,end.y);
    ctx.lineTo(end.x,end.y);
    ctx.strokeStyle = '##FF0000';
    ctx.stroke();
}

function drawText(x,y,text)
{
    ctx.font="11px Georgia";
    ctx.fillText(text,x,y);
}

function calLiveCar()
{
    var liveCarNum = controller.gaCar.numOfLiveCar;
    
    if(controller.listOfCars != undefined){
        for(var i = 0; i < controller.listOfCars.length; i++){
            if(controller.listOfCars[i].isOffRoad == true){
                liveCarNum--;
            }
        }    
    }
    
    
    return liveCarNum;
}
