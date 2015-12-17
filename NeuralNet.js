var AiCarGame = AiCarGame || {};

var bias = -1;
var response = 1;

AiCarGame.NeuralNet = function(inputNumber, outputNumber, hiddenLayerNumber, neuronPerHiddenLayerNumber)
{
    this.inputNum = inputNumber;
    this.outputNum = outputNumber;
    this.hiddenLayerNum = hiddenLayerNumber;
    this.neuronPerHiddenLayerNum = neuronPerHiddenLayerNumber;
    this.layerVec = [ ];
    
    this.initNN = function()
    {
        var j = 0;
        if(this.hiddenLayerNum < 0)
        {
            console.log("hidden layer num is negative");
        }
        else if(this.hiddenLayerNum > 0)
        {
            var i;
            //first hidden layer
            var firstHiddenLayer = new AiCarGame.NeuronLayer(neuronPerHiddenLayerNumber, inputNumber);
            this.layerVec[j++] = firstHiddenLayer;
            //other hidden layers
            for(i = 0; i < this.hiddenLayerNum - 1; i++)
            {
                var hiddenLayer = new AiCarGame.NeuronLayer(neuronPerHiddenLayerNumber, neuronPerHiddenLayerNumber);
                this.layerVec[j++] = hiddenLayer;
            }
            
            //output layer
            var outputLayer = new AiCarGame.NeuronLayer(outputNumber, neuronPerHiddenLayerNumber);
            this.layerVec[j] = outputLayer;
        }
        else
        {
            //No hidden layer
            var outputLayer = new AiCarGame.NeuronLayer(inputNumber, neuronPerHiddenLayerNumber);
            this.layerVec[j] = outputLayer;
        }
    };
    
    
    //weights are going to evolve, has to get all this net's weights & bias
    this.getWeights = function()
    {
        var res = [ ];
        var z = 0;
        var layerNum = this.layerVec.length;
        var i;
        var j;
        var k;
        
        for(i = 0; i < layerNum; i++)
        {
            for(j = 0; j < this.layerVec[i].neuronNum; j++)
            {
                for(k = 0; k < this.layerVec[i].neurons[j].weightVec.length; k++)
                {
                    res[z++] = this.layerVec[i].neurons[j].weightVec[k];
                }
            }
        }
        
        return res;
    };
    
    
    //after one generation, put new weights
    this.putWeights = function(genome)
    {
        var newVecWeights = genome.vecWeights;
        var newWeightVecIndex = 0;
        
        //first hidden layer weight put
        for(var k = 0; k < this.layerVec.length; k++)
        {
            for(var i = 0; i < this.layerVec[k].neuronNum; i++)
            {
                for(var j = 0; j < this.layerVec[k].neurons[i].inputNum + 1; j++)
                {
                    this.layerVec[k].neurons[i].weightVec[j] = newVecWeights[newWeightVecIndex++];
                }
            }
        }
    };
    

    this.sigmoid = function(activation, response)
    {
        var pow = - activation / response;
        var res = 1 / (1 + Math.pow(Math.E, pow));
        return res;
    };
    
    
    this.update = function(perceptronData)
    {
        var inputs = this.perceptronDataToBoolArray(perceptronData);
        var outputs = [ ];
        var weight = 0;
        
        if(inputs.length != this.inputNum)
        {
            return outputs;
        }
        
        for(var j = 0; j < this.hiddenLayerNum + 1; j++)
        {
            if(j > 0)
            {
                inputs = outputs;
            }
            
            outputs = [ ];
            weight = 0;
            
            for(var k = 0; k < this.layerVec[j].neuronNum; k++)
            {
                var netinput = 0;
                for(var m = 0; m < this.layerVec[j].neurons[k].inputNum - 1; m++)
                {
                    netinput += this.layerVec[j].neurons[k].weightVec[m] * inputs[weight++];
                }
                
                netinput += this.layerVec[j].neurons[k].weightVec[this.layerVec[j].neurons[k].inputNum - 1] * bias;
                outputs.push(this.sigmoid(netinput, response));
                weight = 0;    
            }
        }
        
        return outputs;
    };
    
    
    //encoding the net's weight, use feed forward direction
    this.encoding = function()
    {
        var res = this.getWeights();
        return res;
    };
    
    
    this.perceptronDataToBoolArray = function(perceptronData)
    {
        var res = [ ];
        if(perceptronData.right == true)
        {
            res.push(1);
        }
        else
        {
            res.push(0);
        }
        
        if(perceptronData.rightUp == true)
        {
            res.push(1);
        }
        else
        {
            res.push(0);
        }
        
        if(perceptronData.up == true)
        {
            res.push(1);
        }
        else
        {
            res.push(0);
        }
        
        if(perceptronData.leftUp == true)
        {
            res.push(1);
        }
        else
        {
            res.push(0);
        }
        
        if(perceptronData.left == true)
        {
            res.push(1);
        }
        else
        {
            res.push(0);
        }
        
        return res;
    };
};