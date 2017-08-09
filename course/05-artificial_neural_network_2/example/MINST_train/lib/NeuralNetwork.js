function NerualNetwork(layers, rate, active) {
  this._learningRate = rate;
  this._layerCount = layers.length;
  this._activionFunction = active;
  this._net = Array.from({length: layers.length}, function(value, index) {
    return new Matrix(layers[index], 1);
  });
  this._weight = Array.from({length: layers.length - 1}, function(value, index) {
    return new Matrix(layers[index], layers[index + 1], function() {
      return Math.random();
    });
  });
  this._node = Array.from({length: layers.length}, function(value, index) {
    return new Matrix(layers[index], 1);
  });
  this._error = Array.from({length: layers.length}, function(value, index) {
    return new Matrix(layers[index], 1);
  });
}

NerualNetwork.prototype.forwardPropagation = function(input) {
  this._node[0] = input;
  for(let i = 0; i < (this._layerCount - 1); i++) {
    this._net[i + 1] = this._weight[i].transpose().multiply(this._node[i]);
    this._node[i + 1] = this._net[i + 1].map(function(value) {
      return this._activionFunction(value);
    }, this);
  }
  return this._node[this._layerCount - 1];
};

NerualNetwork.prototype.backPropagation = function(label) {
  //complate output layer error
  this._error[this._layerCount - 1] = this._node[this._layerCount - 1].subtract(label);
  //complate hidden layer error
  for(let i = (this._layerCount - 2); i > 0; i--) {
    this._error[i] = this._weight[i].multiply(this._error[i + 1]);
    this._error[i] = this._error[i].dotMultiply(this._node[i]);
    this._error[i] = this._error[i].dotMultiply(this._node[i].map(function(value){
      return 1 - value;
    }));
  }
  //update weight
  for(let i = (this._layerCount - 2); i > 0; i--) {
    let tmp = this._error[i + 1].multiply(this._node[i].transpose());
    tmp = tmp.map(function(value) {
      return this._learningRate * value;
    }, this);
    this._weight[i] = this._weight[i].subtract(tmp.transpose());
  }
};

NerualNetwork.prototype.train = function(input, label) {
  let result = this.forwardPropagation(input);
  this.backPropagation(label);
  return this.cost(result, label);
};

NerualNetwork.prototype.cost = function(result, label) {
  let batch = result.getColumn();
  let cost = 0;
  for(let i = 0; i < batch; i++) {
    for(let j = 0; j < result.getRow(); j++) {
      cost += Math.pow((label.$(j, i) - result.$(j, i)), 2);
    }
  }
  return 0.5*cost/batch;
};

NerualNetwork.prototype.dataCost = function(input, label) {
  let result = this.forwardPropagation(input);
  return this.cost(result, label);
};

NerualNetwork.prototype.test = function(input, label) {
  const MIN = -0xFFFFFF;
  let result = this.forwardPropagation(input);
  let max_h = [MIN, -1];
  let max_y = [MIN, -1];
  for(let i = 0; i < result.getRow(); i++) {
    let h = result.$(i, 0);
    let y = label.$(i, 0);
    if(h > max_h[0]) {
      max_h[0] = h;
      max_h[1] = i;
    }
    if(y > max_y[0]) {
      max_y[0] = y;
      max_y[1] = i;
    }
  }
  return max_h[1] === max_y[1];
};

NerualNetwork.prototype.saveWeight = function(filename) {
  let size = 0;
  this._weight.forEach(function(layer) {
    size += layer.getSize();
  });
  var buffer = new ArrayBuffer(size * 8); //double
  let data = new DataView(buffer);
  this._weight.forEach(function(layer) {
    let column = layer.getColumn();
    layer.forEach(function(e, i, j) {
      data.setFloat64((column * i + j) * 8, e);
    });
  });
  let blob = new Blob([buffer], {type: "application/octet-stream"});
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `${filename}.nnw`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

NerualNetwork.prototype.loadWeight = function(data) {
  let size = 0;
  this._weight.forEach(function(layer) {
    size += layer.getSize();
  });
  if(size * 8 === data.byteLength) {
    this._weight = this._weight.map(function(layer) {
      let column = layer.getColumn();
      return layer.map(function(e, i, j) {
        return data.getFloat64((column * i + j) * 8);
      });
    });
  }
};