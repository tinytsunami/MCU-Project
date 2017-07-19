(function() {
  //===========================================
  // DOM part
  //===========================================
  let log = document.getElementsByTagName("pre")[0];
  let canvas = document.getElementsByTagName("canvas")[0];
  let context = canvas.getContext("2d");
  let logic = document.getElementsByName("logic");

  logic.forEach(function(element){
    element.onchange = function(){
      let select = Array.from(logic).map(function(item){
        return item.checked;
      }).indexOf(true);
      refresh(select);
    };
  });
  //===========================================
  // Canvas part
  //===========================================
  const POINT_SIZE = 2;
  const SIZE = 200;
  const LINE_COLOR = "#EEEEEE";

  let canvasInitialize = function(){
    canvas.width = SIZE * 2;
    canvas.height = SIZE * 2;
    context.translate(SIZE, SIZE);
    context.font = "15px Arial";
    
  };

  let canvasRefresh = function() {
    context.clearRect(-SIZE, -SIZE, SIZE, SIZE);
    drawLine(0, -SIZE, 0, SIZE, LINE_COLOR);
    drawLine(-SIZE, 0, SIZE, 0, LINE_COLOR);
    if(data) {
      testH();
    }
  };

  //test.onclick
  let testH = function() {
    for(let x1 = 0; x1 <= 10; x1++) {
      for(let x2 = 0; x2 <= 10; x2++) {
        let y = h([1, x1 / 10, x2 / 10]);
        drawPoint(x1 * 10, x2 * 10, getColor(y));
      }
    }
  };

  let reSize = function(v) {
    return 100 * v;
  };

  let format = function(str){
    return str.length == 1 ? "0" + str : str;
  };

  let getColor = function(y) {
    let value = Math.abs(Math.ceil(y * 255));
    let red = format(value.toString(16));
    let blue = format((255 - value).toString(16));
    let color = `#${red}00${blue}`;
    return color;
  };

  let drawPoint = function(x, y, color){
    context.strokeStyle = color;
    context.beginPath();
    context.arc(x, -y, POINT_SIZE, 0, POINT_SIZE*Math.PI);
    context.closePath();
    context.stroke();
  };

  let drawLine = function(x1, y1, x2, y2, color){
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x1, -y1);
    context.lineTo(x2, -y2);
    context.closePath();
    context.stroke();
  };

  //===========================================
  // Logistic regression part
  //-------------------------------------------
  // Logistic regression,
  // this is main for the example.
  //===========================================
  let n = 0;
  let data = null;
  let alpha = 5; //lreaning rate
  let theta = null; //weight

  //sigmoid function
  let sigmoid = function(x) {
    return 1/(1+ Math.exp(-x));
  };

  //hypothesis function
  let h = function(x) {
    let sum = 0;
    for(let j = 0; j < n; j++) {
      sum += theta[j] * x[j];
    }
    return sigmoid(sum);
  };

  //cost function
  let J = function(x, y) {
    let sum = 0;
    for(let i in x) {
      sum += y[i] * (-Math.log(h(x[i]))) + (1 - y[i]) * (-Math.log(1 - h(x[i])));
    }
    return (1/x.length)*sum; 
  };

  //cost function gradient
  let dJ = function(x, y) {
    let tmp = Array.from({length: n}, function(x){return 0;});
    for(let i in x) {
      for(let j = 0; j < n; j++) {
        tmp[j] += (h(x[i]) - y[i]) * x[i][j];
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
    let trainDataX = data.map(function(item){return item.x;});
    let trainDataY = data.map(function(item){return item.y;});
    let grad = dJ(trainDataX, trainDataY);
    log.innerHTML += `Cost: ${J(trainDataX, trainDataY)}\n`;
    log.scrollTop = log.scrollHeight;
    for(let j = 0; j < n; j++) {
      theta[j] -= alpha * grad[j];
    }
  };

  //repeat process
  setInterval(function() { 
    canvasRefresh();
    if(data) {
      process_train();
    }
  }, 1);

  let refresh = function(select) {
    switch(select) {
      case 0:
        data = [{x: [0], y: 1},
                {x: [1], y: 0}];
        break;
      case 1:
        data = [{x: [0, 0], y: 0},
                {x: [0, 1], y: 1},
                {x: [1, 0], y: 1},
                {x: [1, 1], y: 1}];
        break;
      case 2:
        data = [{x: [0, 0], y: 0},
                {x: [0, 1], y: 0},
                {x: [1, 0], y: 0},
                {x: [1, 1], y: 1}];
        break;
      case 3:
        data = [{x: [0, 0], y: 0},
                {x: [0, 1], y: 1},
                {x: [1, 0], y: 1},
                {x: [1, 1], y: 0}];
        break;
    }
    data = data.map(function(item){
      item.x = [1].concat(item.x);
      return item;
    });
    n = data[0].x.length;
    theta = Array.from({length: n}, function(x){return 1;});
  };

  canvasInitialize();
})();