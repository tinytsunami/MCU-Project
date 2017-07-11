(function() {
  //===========================================
  // HTML DOM part
  //-------------------------------------------
  // define node for html.
  //===========================================
  let input = document.getElementsByTagName("input")[0];
  let log = document.getElementsByTagName("pre")[0];
  let train = document.getElementsByTagName("button")[0];
  let test = document.getElementsByTagName("button")[1];
  let typeNode = document.getElementsByTagName("select")[0];
  let predictionNode = document.getElementsByTagName("input");

  //===========================================
  // Data part
  //-------------------------------------------
  // read data from CSV file,
  // define parse and normalization function.
  //===========================================
  let n = 0; //count of features
  let trainDataX = [];
  let trainDataY = [];
  let testDataX = [];
  let testDataY = [];
  let table = null;
  let statis = {
    max: null,
    min: null,
    ave: null
  };

  input.onchange = function() {
    let file = this.files[0];
    let file_reader = new FileReader();
    file_reader.onload = function(event) {
      //string process
      log.innerHTML += `已載入資料\r\n`;
      let text = event.target.result;
      let data = text.split("\n");
      //remove title of row
      log.innerHTML += `解析資料中\r\n`;
      data.splice(0, 1);
      //parse for data(string to number)
      data = data.map(function(item) {
        let tmp = item.split(",");
        tmp = tmp.map(function(str, index) {
          if(index == 0)
            return str;
          else
            return Number(str);
        });
        return tmp;
      });
      n = data[0].length;
      //data coding scan
      table = [];
      data.forEach(function(item) {
        if(!table.includes(item[0])) {
          table.push(item[0]);
        }
      });
      data = data.map(function(item) {
        item[0] = 1 + table.indexOf(item[0]);
        return item;
      });
      log.innerHTML += `已完成編碼：\r\n`;
      table.forEach(function(name, index) {
        log.innerHTML += `${name}=>${1 + index}\r\n`;
      });
      //find data max and min
      statis.max = Array.from({length: n}, function(x) {return 0;});
      statis.min = Array.from({length: n}, function(x) {return 0xfffffff;});
      statis.ave = Array.from({length: n}, function(x) {return 0;});
      data.forEach(function(item) {
        item.forEach(function(feature, index) {
          if(feature > statis.max[index]) {
            statis.max[index] = feature;
          }
          if(feature < statis.min[index]) {
            statis.min[index] = feature;
          }
          statis.ave[index] += feature;
        });
      });
      statis.ave = statis.ave.map(function(count) {
        return count / data.length;
      });
      log.innerHTML += `類型區間：[${statis.min[0]}, ${statis.max[0]}]\r\n`;
      log.innerHTML += `年份區間：[${statis.min[1]}, ${statis.max[1]}]\r\n`;
      log.innerHTML += `樓層區間：[${statis.min[2]}, ${statis.max[2]}]\r\n`;
      log.innerHTML += `總坪數區間：[${statis.min[3]}, ${statis.max[3]}]\r\n`;
      log.innerHTML += `房間數區間：[${statis.min[4]}, ${statis.max[4]}]\r\n`;
      log.innerHTML += `價位區間：[${statis.min[5]}, ${statis.max[5]}]\r\n`;
      //feature scaling
      data = data.map(function(item) {
        item = item.map(function(feature, index) {
          let max = statis.max[index];
          let min = statis.min[index];
          let ave = statis.ave[index];
          return featureScaling(feature, max, min, ave);
        });
        return item;
      });
      log.innerHTML += `全部資料正規化至：[-0.5, 0.5]\r\n`;
      // assign data to train or test
      log.innerHTML += `資料的總整理：\r\n`;
      let cut_point = Math.floor(data.length*2/3);
      let trainData = data.slice(0, cut_point);
      let testData = data.slice(cut_point + 1, data.length);
      trainDataX = trainData.map(function(item) {
        return [1].concat(item.slice(0, item.length - 1));
      });
      trainDataY = trainData.map(function(item) {
        return item[item.length - 1];
      });
      testDataX = testData.map(function(item) {
        return [1].concat(item.slice(0, item.length - 1));
      });
      testDataY = testData.map(function(item) {
        return item[item.length - 1];
      });
      log.innerHTML += `訓練資料，共 ${cut_point} 筆\r\n`;
      log.innerHTML += `測試資料，共 ${data.length - cut_point - 1} 筆\r\n`;
      log.innerHTML += `等待開始訓練\r\n`;
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
  // Muiltple linear regression part
  //-------------------------------------------
  // Muiltple linear regression,
  // this is main for the example.
  //===========================================
  let lock = true; //train controller
  let alpha = 0.05; //lreaning rate
  let theta = null; //weight

  //hypothesis function
  let h = function(x, theta) {
    let sum = 0;
    for(let j = 0; j < n; j++) {
      sum += theta[j] * x[j];
    }
    return sum;
  };

  //cost function
  let J = function(x, y, theta) {
    let sum = 0;
    for(let i in x) {
      sum += Math.pow(h(x[i], theta) - y[i], 2);
    }
    return (1/(2*x.length))*sum; 
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
    let cost = J(trainDataX, trainDataY, theta);
    let grad = dJ(trainDataX, trainDataY, theta);
    for(let j = 0; j < n; j++) {
      theta[j] -= alpha * grad[j];
    }
    let showCost = Math.floor(cost * 1000)/1000;
    if(showCostTmp != showCost) {
      log.innerHTML += `訓練中，估計成本：${showCost}\r\n`;
      log.scrollTop = log.scrollHeight;
      showCostTmp = showCost;
    }
  };

  let process_test = function() {
    let cost = J(testDataX, testDataY, theta);
    let showCost = Math.floor(cost * 1000)/1000;
    if(showCostTmp != showCost) {
      log.innerHTML += `測試成本：${showCost}\r\n`;
      log.scrollTop = log.scrollHeight;
      showCostTmp = showCost;
    }
    test_start = false;
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

  test.onclick = function() {
    lock = true;
    process_test();
  };

  //show and wait...
  log.innerHTML += `等待中，尚未載入資料\r\n`;

  let prediction = function(){
    let type = Number(typeNode.value);
    let old = Number(predictionNode[1].value);
    let floor = Number(predictionNode[2].value);
    let ping = Number(predictionNode[3].value);
    let room = Number(predictionNode[4].value);
    let output = function(num){
      predictionNode[5].value = num;
    };
    let predictionX = [type, old, floor, ping, room];
    predictionX = predictionX.map(function(feature, index) {
      let max = statis.max[index];
      let min = statis.min[index];
      let ave = statis.ave[index];
      return featureScaling(feature, max, min, ave);
    });
    predictionX = [1].concat(predictionX);
    let price = h(predictionX, theta);
    price = antiFeatureScaling(price, statis.max[5], statis.min[5], statis.ave[5]);
    output(Math.floor(price * 100)/100);
  };

})();