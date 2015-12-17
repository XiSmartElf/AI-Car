var AiCarGame = AiCarGame || {};

AiCarGame.NeuronLayer = function(neuronNumber, inputNumPerNeuron){
    this.neuronNum = neuronNumber;
    
    this.neurons = [ ];
    
    var i;
    
    for(i = 0; i < this.neuronNum; i++){
        var neuron = new AiCarGame.Neuron(inputNumPerNeuron);
        neuron.initWeightVec();
        this.neurons[i] = neuron;
    }
    
    
}