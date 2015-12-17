// global namespace
var AiCarGame = AiCarGame || {};

AiCarGame.FlowController= function()
{
    this.listOfCars = undefined;
    this.roadImgSrc = "Images/road.png";
    this.roadBitMap = undefined;
    //crossOverRt, mutationRt, popSize, choromLen, totalFitScore, iGenNum, isBusyOrNot
    this.gaCar = new AiCarGame.GACar(0.7, 0.2, 100, 29, 0, 0, false);
    this.isTrainMode = false;
    this.gameSpeed = undefined;
    //UI canvas calls this function whenever it needs to draw the cars for one frame.
    this.drawInfo_to_UI_layer = function()
    {
        return { 
            listOfCars: this.listOfCars,
            roadImgSrc: this.roadImgSrc
        };
    };
    
    //Where the game first time begins.
    this.CycleBegins = function(isTrainMode)
    {
        this.isTrainMode = isTrainMode;
        if(!isTrainMode)
        {
            //make a initial list of cars to join the current game round/generation
            this.listOfCars = this.manufactureCars(1);
            var nn = new AiCarGame.NeuralNet(5,1,1,4);
            nn.initNN();
            var genome = new AiCarGame.Genome(nn);
            genome.vecWeights = [1.2581561622209847, 1.9891930310986936, -0.21818495634943247, 0.38272207556292415, 1.3296459466218948, 1.228598112706095, 0.7906146007589996, 2.634965751785785, 1.616528993472457, 0.42190361581742764, 1.791336624417454, 1.0218712468631566, 1.1300318422727287, 2.6152715706266463, 1.4817361803725362, 0.4861882980912924, 2.6848983424715698, 2.5406845775432885, 2.7571670874021947, 0.9243481433950365, 1.2927837511524558, 2.170495778787881, 1.4571948614902794, 2.5534986592829227, 1.4123877938836813, 2.7020778809674084, 2.7756143757142127, 3.2124614091590047, 2.138803831767291];
            nn.putWeights(genome);
            this.listOfCars[0].genome = genome;
        }
        else
        {
            //create cars
            this.listOfCars = this.manufactureCars(this.gaCar.populationSize);
            //create genomes
            this.gaCar.createStartPopulation();
            //install car's genome
            this.gaCar.carGenomeInstall(this.listOfCars);
        }
          
        //start the first round game with init properties.
        //define a game context with these cars
        //road bitmap is set by the canvas during the first UI draw.
        var oneGame = new AiCarGame.GameModel(this.listOfCars, this.roadBitMap);
        oneGame.startGame(this, isTrainMode,this.gameSpeed);       
    };
    
    //start the next game by call back this function in gameModel once a game is done/
    this.nextRoundCallBack = function()
    {
        var fitnessVec = [];
        for(var car of this.listOfCars)
        {
            fitnessVec.push(car.fitness);
            car.genome.fitness = car.fitness;
        }
            
        this.gaCar.updateFitnessScores(fitnessVec);
        console.log("Generation # "+ this.gaCar.iGeneration+" ==> Best score:" + this.gaCar.bestFitnessScore);
        this.printWeightVec(this.gaCar.fittestGenome.vecWeights);
        this.gaCar.epoch();

        this.listOfCars = this.manufactureCars(this.gaCar.populationSize);
        this.gaCar.carGenomeInstall(this.listOfCars);
        for(var i = 0; i < this.listOfCars.length; i++){
            this.listOfCars[i].genome.neuralNet.putWeights(this.gaCar.genomeVec[i]);
        }
            
        //Start the next round.
        AiCarGame.Car.nextCarId=0;
        var oneGame = new AiCarGame.GameModel(this.listOfCars, this.roadBitMap);
        oneGame.startGame(this, this.isTrainMode,this.gameSpeed);
    };
    
    
    this.manufactureCars = function(carNum){
        //return a list of cars
        var carList = [ ];
        for(var i=0; i<carNum; i++)
        {
            var carProperties = {
                startLocX:300, 
                startLocY:125, 
                angle:0,
                width:20,
                height:40,
                detectRadius:35
            };
            var car = new AiCarGame.Car(this.roadBitMap, carProperties);
           carList.push(car);
        }
        
        return carList;
    };
    
    
    this.printWeightVec = function(weightVec){
        var printRes = "";
        for(var i = 0; i < weightVec.length; i++){
            printRes = printRes.concat(weightVec[i], ",");
        }
        
        console.log(printRes);
    }
};