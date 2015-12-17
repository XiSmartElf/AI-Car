// global namespace
var AiCarGame = AiCarGame || {};

AiCarGame.Neuron = function(inputNumber){
    
    //the number of input
    this.inputNum = inputNumber;
    //weight for each input
    this.weightVec = [ ];
    
    
    //init this neuron's weight vector
    this.initWeightVec = function(){
        if(this.weightVec.length == 0){
            var i;
            //init inputNum + 1's weight, the additional 1 weight is the bias, the threshold
            for(i = 0; i < this.inputNum + 1; i++){
                //create a random number between -1 to 1
                this.weightVec[i] = -1 + 2 * Math.random();
            }
        }
    }
    
    
    
    this.updateWeightVec = function(){
        
    }
    
    
}