(function(){
  //===========================================
  // HTML DOM part
  //-------------------------------------------
  // define node for html.
  //===========================================
  let canvas = document.getElementsByTagName("canvas")[0];
  let input = document.getElementsByTagName("input")[0];
  let log = document.getElementsByTagName("pre")[0];
  let train = document.getElementsByTagName("button")[0];
  let test = document.getElementsByTagName("button")[1];
  let prediction_input = document.getElementsByTagName("input")[1];
  let prediction_output = document.getElementsByTagName("input")[2];

  //===========================================
  // Canvas part
  //-------------------------------------------
  // define variable about canvas node,
  // initialize parameters of canvas.
  //===========================================
  const SIZE = 600;
  const TRAIN_COLOR = "#333333";
  const LINE_COLOR = "#FF0000";
  const TEST_COLOR = "#3333AA";
  let context = canvas.getContext("2d");

  let initialize = function(){
    canvas.width = SIZE;
    canvas.height = SIZE;
    context.font = "15px Arial";
  };

  let refresh = function(draw_test){
    context.clearRect(0, 0, SIZE, SIZE);
    if(!draw_test){
      train_data.forEach(function(item){
        drawPoint(item[0]*SIZE, item[1]*SIZE, TRAIN_COLOR);
      });
    }else{
      test_data.forEach(function(item){
        drawPoint(item[0]*SIZE, item[1]*SIZE, TEST_COLOR);
      });
    }
    drawLine(0, h(0, theta), SIZE, h(SIZE, theta), LINE_COLOR);
  };

  let drawPoint = function(x, y, color){
    context.strokeStyle = color;
    context.beginPath();
    context.arc(x, SIZE-y, 2, 0, 2*Math.PI);
    context.closePath();
    context.stroke();
  };

  let drawLine = function(x1, y1, x2, y2, color){
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x1, SIZE-y1);
    context.lineTo(x2, SIZE-y2);
    context.closePath();
    context.stroke();
  };

  //===========================================
  // Data part
  //-------------------------------------------
  // read data from CSV file,
  // define parse and normalization function.
  //===========================================
  let train_data = null;
  let test_data = null;
  let pings = {max: 0, min: 0xfffffff};
  let price = {max: 0, min: 0xfffffff};

  input.onchange = function(){
    let file = this.files[0];
    let file_reader = new FileReader();
    file_reader.onload = function(event){
      //string process
      log.innerHTML += `已載入資料\r\n`;
      let text = event.target.result;
      let data = text.split("\n");
      //remove title of row
      log.innerHTML += `解析資料中\r\n`;
      data.splice(0, 1);
      //parse for data(string to number)
      data = data.map(function(item){
        let tmp = item.split(",");
        tmp = tmp.map(function(str){
          return Number(str);
        });
        return tmp;
      });
      //clear extreme
      data = data.filter(function(item){
        return item[1] <= 10000;
      });
      //find data max and min
      log.innerHTML += `資料正規化\r\n`;
      data.forEach(function(item){
        if(item[0] < pings.min)
          pings.min = item[0];
        else if(item[0] > pings.max)
          pings.max = item[0];
        if(item[1] < price.min)
          price.min = item[1];
        else if(item[1] > price.max)
          price.max = item[1];
      });
      log.innerHTML += `坪數區間：[${pings.min}坪, ${pings.max}坪]\r\n`;
      log.innerHTML += `價格區間：[${price.min}萬, ${price.max}萬]\r\n`;
      // normalization for data
      let normal_pings = normalization(pings);
      let normal_price = normalization(price);
      data = data.map(function(item){
        item[0] = normal_pings(item[0]);
        item[1] = normal_price(item[1]);
        return item;
      });
      // assign data to train or test
      log.innerHTML += `資料的總整理：\r\n`;
      let cut_point = Math.floor(data.length*2/3);
      train_data = data.slice(0, cut_point);
      test_data = data.slice(cut_point + 1, data.length);
      log.innerHTML += `訓練資料，共 ${cut_point} 筆\r\n`;
      log.innerHTML += `測試資料，共 ${data.length - cut_point - 1} 筆\r\n`;
      log.innerHTML += `等待開始訓練\r\n`;
      refresh(false);
    };
    file_reader.readAsText(file);
  };

  let normalization = function(obj){
    return function(value){
      return (value - obj.min) / (obj.max - obj.min);
    };
  };

  let anti_normalization = function(obj){
    return function(value){
      return value * (obj.max - obj.min) + obj.min;
    };
  };

  //===========================================
  // SLR part
  //-------------------------------------------
  // simple linear regression(SLR),
  // this is main for the example.
  //===========================================
  let lock = true; //train controller
  let x = []; //train data
  let y = []; //train data(tag)
  let tx = []; //test data
  let ty = []; //test data(tag)
  let alpha = 0.00005; //lreaning rate
  let theta = [0, 0]; //weight

  //hypothesis function
  let h = function(x, theta){
    return (theta[0] + theta[1] * x);
  };

  //cost function
  let J = function(x, y, theta){
    let sum = 0;
    for(let i in x)
      sum += Math.pow(h(x[i], theta) - y[i], 2);
    return (1/(2*x.length))*sum; 
  };

  //cost function gradient
  let dJ = function(x, y, theta){
    let tmp = [0, 0];
    for(let i in x){
      tmp[0] += (h(x[i], theta) - y[i]);
      tmp[1] += (h(x[i], theta) - y[i]) * x[i];
    }
    tmp[0] /= x.length;
    tmp[1] /= x.length;
    return tmp;
  };

  //iteration function
  let showCostTmp = 0;
  let process_train = function(){
    let cost = J(x, y, theta);
    let grad = dJ(x, y, theta);
    theta[0] -= alpha * grad[0] * 1000;
    theta[1] -= alpha * grad[1];
    let showCost = Math.floor(cost * 1000)/1000;
    if(showCostTmp != showCost){
      log.innerHTML += `訓練中，估計成本：${showCost}\r\n`;
      log.scrollTop = log.scrollHeight;
      showCostTmp = showCost;
    }
  };

  let process_test = function(){
    let cost = J(tx, ty, theta);
    let showCost = Math.floor(cost * 1000)/1000;
    if(showCostTmp != showCost){
      log.innerHTML += `測試成本：${showCost}\r\n`;
      log.scrollTop = log.scrollHeight;
      showCostTmp = showCost;
    }
    test_start = false;
  };
  
  //repeat process
  setInterval(function(){  
    if(!lock && x.length > 0){
      process_train();
      refresh(false);
    }
  }, 1);

  //control for user
  train.onclick = function(){
    x = train_data.map(function(item){
      return item[0] * SIZE;
    });
    y = train_data.map(function(item){
      return item[1] * SIZE;
    });
    lock = !lock;
  };

  test.onclick = function(){
    lock = true;
    tx = test_data.map(function(item){
      return item[0] * SIZE;
    });
    ty = test_data.map(function(item){
      return item[1] * SIZE;
    });
    process_test();
    refresh(true);
  };

  //prediction
  prediction_input.onchange = function(){
    let value = prediction_input.value;
    prediction_output.value = Math.floor(h(value, theta)*100)/100;
  };

  //show and wait...
  log.innerHTML += `等待中，尚未載入資料\r\n`;
  initialize();
})();