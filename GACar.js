var AiCarGame = AiCarGame || {};

var maxPertubation = (-1 + 2 * Math.random()) / 10;
var defaultInputNum = 5;
var defaultOutputNum = 1;
var defaultHiddenLayerNum = 1;
var defaultNeuronPerHiddenLayerNum = 4;

AiCarGame.GACar = function(crossOverRt, mutationRt, popSize, choromLen, totalFitScore, iGenNum, isBusyOrNot){
    this.genomeVec = [ ];
    
    this.populationSize = popSize;//20
    
    this.crossoverRate = crossOverRt;//0.7
    
    this.mutationRate = mutationRt;//0.1, mutationRate will be higher for floating genetic algorithm
    
    //choromolength = genome's vecWeights.length
    this.choromoLength = choromLen;
    
    this.fittestGenome;
    this.bestFitnessScore;
    this.bestFitnessScoreSoFar = 0;
    this.totalFitnessScore = totalFitScore;
    this.vecFitness = [ ];
    this.iGeneration = iGenNum;
    
    this.isBusy = isBusyOrNot
    
    this.numOfLiveCar = popSize;
    
    this.mutate = function(genome)
    {
        var z;
        
        for(z = 0; z < genome.vecWeights.length; z++)
        {
            var ran = Math.random();
            if(ran < this.mutationRate)
            {
                genome.vecWeights[z] += maxPertubation;
            }
        }
    };
    
    
    //pass in 4 genomes
    this.crossover = function(mom, dad, baby1, baby2)
    {
        var p;
        var q;
        //no need to crossover situation
        if(Math.random() > this.crossoverRate || (mom == dad))
        {
            baby1 = mom;
            baby2 = dad;
            return;
        }
        
        var crossoverPoint = (Math.random() * (this.choromoLength - 1)).toFixed();
        for(p = 0; p < crossoverPoint; p++)
        {
            baby1.vecWeights[p] = mom.vecWeights[p];
            baby2.vecWeights[p] = dad.vecWeights[p];
        }
        
        for(q = crossoverPoint; q < mom.vecWeights.length; q++)
        {
            baby1.vecWeights[q] = dad.vecWeights[q];
            baby2.vecWeights[q] = mom.vecWeights[q];
        }
    };

    
    //the genome with higher fitness score has higher probability to be selected
    this.rouletteWheelSelection = function()
    {
        //return a genome
        var slice = Math.random() * this.totalFitnessScore;
        var total = 0;
        var selectedGenome = 0;
        var l = 0;
        
        for(l = 0; l < this.populationSize; l++)
        {
            total += this.genomeVec[l].fitness;
            
            if(total >= slice)
            {
                selectedGenome = l;
                
                break;
            }
        }

        return this.genomeVec[selectedGenome];
    };
    
    
    
    //when one round ends, flow controller will call this function to set this generation's fitnessVec
    this.updateFitnessScores = function(vecFit)
    {
        if(vecFit.length == this.populationSize)
        {
             this.vecFitness = vecFit;
        }
        else
        {
            console.log("num of pass in vecFit not match population size");
            return;
        }
        
        //update best fitness score & vecFitness
        var y;
        var maxFitness = Number.MIN_VALUE;
        var sumFitnessScore = 0;
        
        for(y = 0; y < this.genomeVec.length; y++)
        {
            this.genomeVec[y].fitness = vecFit[y];
            //update best fitness score
            if(this.vecFitness[y] > maxFitness)
            {
                maxFitness = this.vecFitness[y];
                this.fittestGenome = this.genomeVec[y];
            }
            
            sumFitnessScore += this.genomeVec[y].fitness;
        }
        
        this.bestFitnessScore = maxFitness;
        this.totalFitnessScore = sumFitnessScore;
    };
    

    this.createStartPopulation = function()
    {
        //create car with neural net with random weights
        var i;
        
        for(i = 0; i < this.populationSize; i++)
        {
            var neuralNet = new AiCarGame.NeuralNet(defaultInputNum,defaultOutputNum,defaultHiddenLayerNum,defaultNeuronPerHiddenLayerNum);
            //init Neural Net with random weight
            neuralNet.initNN();
            var genome = new AiCarGame.Genome(neuralNet);
            this.genomeVec[i] = genome;
        }
    };
    
    
    
    this.epoch = function()
    {
        //this.updateFitnessScores();
        var newBabiesCnt = 0;
        //var newCarsCnt = 0;
        var babyGenomesVec = [ ];

        //a new genonme generation
        while(newBabiesCnt < this.populationSize)
        {
            var mom = this.rouletteWheelSelection();
            var dad = this.rouletteWheelSelection();
            
            var nn1 = new AiCarGame.NeuralNet(defaultInputNum,defaultOutputNum,defaultHiddenLayerNum,defaultNeuronPerHiddenLayerNum);
            var nn2 = new AiCarGame.NeuralNet(defaultInputNum,defaultOutputNum,defaultHiddenLayerNum,defaultNeuronPerHiddenLayerNum);
            nn1.initNN();
            nn2.initNN();
            var baby1 = new AiCarGame.Genome(nn1);
            var baby2 = new AiCarGame.Genome(nn2);
            
            this.crossover(mom, dad, baby1, baby2);
            
            this.mutate(baby1);
            this.mutate(baby2);
            
            babyGenomesVec[newBabiesCnt++] = baby1;
            babyGenomesVec[newBabiesCnt++] = baby2;
            
            baby1.iGeneration++;
            baby2.iGeneration++;
        }
        
        //a new genome generation
        this.genomeVec = babyGenomesVec;
        //a new car generation
        this.iGeneration++;
    };
    
    
    //install car with genome
    this.carGenomeInstall = function(carList)
    {
        var i;
        for(i = 0; i < carList.length; i++)
        {
            carList[i].genome = this.genomeVec[i];
        }
    };
    
    
    this.setHistoryBest = function(){
        if(this.bestFitnessScore > this.bestFitnessScoreSoFar){
            this.bestFitnessScoreSoFar = this.bestFitnessScore;
        }
    }
};