(function() {
  //===========================================
  // Data part
  //-------------------------------------------
  // read data from CSV file,
  // define parse and normalization function.
  //===========================================
  let n = 0; //count of features

  input.onchange = function() {
    let file = this.files[0];
    let file_reader = new FileReader();
    file_reader.onload = function(event) {
      let text = event.target.result;
      //...
    };
    file_reader.readAsText(file);
  };

  let featureScaling = function(value, max, min, ave) {
    return (value - ave) / (max - min);
  };

  let antiFeatureScaling = function(value, max, min, ave) {
    return value * (max - min) + ave;
  };

  //===========================================
  // Logistic regression part
  //-------------------------------------------
  // Logistic regression,
  // this is main for the example.
  //===========================================
  let lock = true; //train controller
  let alpha = 0.05; //lreaning rate
  let theta = null; //weight

  //sigmoid function
  let sigmoid = function(x) {
    return 1/(1+ Math.exp(-x));
  };

  //hypothesis function
  let h = function(x, theta) {
    let sum = 0;
    for(let j = 0; j < n; j++) {
      sum += theta[j] * x[j];
    }
    return sigmoid(sum);
  };

  //cost function
  let J = function(x, y, theta) {
    let sum = 0;
    for(let i in x) {
      sum += y[i] * (-Math.log(h(x[i], theta))) + (1 - y[i]) * (-Math.log(1 - h(x[i], theta)));
    }
    return (1/x.length)*sum; 
  };

  //cost function gradient
  let dJ = function(x, y, theta) {
    let tmp = Array.from({length: n}, function(x){return 0;});
    for(let i in x) {
      for(let j = 0; j < n; j++) {
        tmp[j] += (h(x[i], theta) - y[i]) * x[i][j];
      }
    }
    for(let j = 0; j < n; j++) {
      tmp[j] /= x.length;
    }
    return tmp;
  };

  //iteration function
  let showCostTmp = 0;
  let process_train = function() {
    let grad = dJ(trainDataX, trainDataY, theta);
    for(let j = 0; j < n; j++) {
      theta[j] -= alpha * grad[j];
    }
  };

  //repeat process
  setInterval(function() { 
    if(!lock) {
      process_train();
      prediction();
    }
  }, 1);

  //control for user
  train.onclick = function() {
    theta = Array.from({length: n}, function(x){return 0;});
    lock = !lock;
  };

  let prediction = function(){
    //...
  };

})();