var AiCarGame = AiCarGame || {};

AiCarGame.Genome = function(neuralNet){
    
    this.neuralNet = neuralNet;
    
    this.vecWeights = neuralNet.encoding();
    
    this.fitness = 0;
    
    this.iGeneration = 0;
};