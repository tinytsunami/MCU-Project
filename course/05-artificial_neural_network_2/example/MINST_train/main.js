//NN
let nn = new NerualNetwork([784, 300, 10], 0.1, function(x) {
  return 1 / (1 + Math.exp(-x));
});

(function() {
  //HTML DOM
  let dataLoader = document.getElementById("data_loader");
  let dataInput = dataLoader.getElementsByTagName("input")[0];
  let dataLog = dataLoader.getElementsByTagName("span")[0];
  let labelLoader = document.getElementById("label_loader");
  let labelInput = labelLoader.getElementsByTagName("input")[0];
  let labelLog = labelLoader.getElementsByTagName("span")[0];
  let testDataLoader = document.getElementById("test_data_loader");
  let testDataInput = testDataLoader.getElementsByTagName("input")[0];
  let testDataLog = testDataLoader.getElementsByTagName("span")[0];
  let testLabelLoader = document.getElementById("test_label_loader");
  let testLabelInput = testLabelLoader.getElementsByTagName("input")[0];
  let testLabelLog = testLabelLoader.getElementsByTagName("span")[0];
  let loaderController = document.getElementById("loader_controller");
  let readyButton = loaderController.getElementsByTagName("button")[0];
  let trainButton = loaderController.getElementsByTagName("button")[1];
  let testButton = loaderController.getElementsByTagName("button")[2];
  let weightLoader = document.getElementById("weight_loader");
  let weightInput = weightLoader.getElementsByTagName("input")[0];
  let weightLog = weightLoader.getElementsByTagName("span")[0];
  let log = document.getElementsByTagName("pre")[0];

  //origin binary file
  let trainData = {
    contents: null,
    labels: null,
    count: 0,
    width: 0,
    height: 0,
    getImageMatrix: null,
    getLabelMatrix: null
  };

  //test binary file
  let testData = {
    contents: null,
    labels: null,
    count: 0,
    width: 0,
    height: 0,
    getImageMatrix: null,
    getLabelMatrix: null
  };

  //taring lock
  let lock = true;

  //loading file
  let loading = function(loadCallback, propressCallback) {
    return function() {
      let blob = null;
      let file = this.files[0];
      let fileReader = new FileReader();
      fileReader.onprogress = function() {
        propressCallback.call(this, Math.floor(event.loaded / event.total * 100));
      };
      fileReader.onload = function() {
        loadCallback.call(this, new DataView(event.target.result));
      };
      blob = file.slice(0, file.size);
      fileReader.readAsArrayBuffer(blob);
    };
  };
  
  let callbackForData = function(data) {
    return function(contents) {
      let magicNumber = contents.getInt32(0);
      if(magicNumber === 2051) {
        data.contents = contents;
        data.count = contents.getInt32(4);
        data.width = contents.getInt32(8);
        data.height = contents.getInt32(12);
        data.getImageMatrix = function(index){
          let image = new Matrix(data.width * data.height, 1);
          let offset = 16 + index * (data.width * data.height);
          for(let y = 0; y < data.height; y++) {
            for(let x = 0; x < data.width; x++) {
              let value = this.contents.getUint8(offset + y * data.width + x);
              image.setValue(y * data.width + x, 0, value);
            }
          }
          return image;
        };
      }
    };
  }

  let callbackForLabel = function(data) {
    return function(contents) {
      let magicNumber = contents.getInt32(0);
      if(magicNumber === 2049) {
        data.labels = contents;
        data.count = contents.getInt32(4);
        data.getLabelMatrix = function(index) {
          let label = new Matrix(10, 1);
          let offset = 8 + index;
          let value = this.labels.getUint8(offset);
          label.setValue(value, 0, 1);
          return label;
        };
      }
    }
  };

  let callbackForPropress = function(node) {
    return function(rate) {
      node.innerHTML = `${rate}%`;
    };
  };

  //event
  dataInput.onchange = loading(callbackForData(trainData), callbackForPropress(dataLog));
  labelInput.onchange = loading(callbackForLabel(trainData), callbackForPropress(labelLog));
  testDataInput.onchange = loading(callbackForData(testData), callbackForPropress(testDataLog));
  testLabelInput.onchange = loading(callbackForLabel(testData), callbackForPropress(testLabelLog));
  weightInput.onchange = loading(function(contents) {
    nn.loadWeight(contents);
  }, callbackForPropress(weightLog));

  readyButton.onclick = function() {
    if(trainData.getImageMatrix && trainData.getLabelMatrix) {
      trainButton.disabled = false;
    }
  };

  trainButton.onclick = function() {
    lock = !lock;
    testButton.disabled = !lock;
  };

  testButton.onclick = function() {
    let error = 0;
    let count = testData.count;
    let index = 0;
    let repeat = setInterval(function() {
      let image = testData.getImageMatrix(index);
      let label = testData.getLabelMatrix(index);
      error += nn.test(image, label) ? 0 : 1;
      log.innerHTML = `error rate: ${error}/${count}\n`;
      index += 1;
      if(index > count) {
        clearInterval(repeat);
      }
    }, 100);
  };

  //training
  let times = 0;
  let batch = 100;
  let offset = 0;
  let image = new Matrix(784, batch);
  let label = new Matrix(10, batch);
  let cost = 0;
  let i, j;

  setInterval(function() {
    if(!lock) {
      for(i = 0; i < batch; i++) {
        let index = (offset + i) % trainData.count;
        let tmp1 = trainData.getImageMatrix(index);
        let tmp2 = trainData.getLabelMatrix(index);
        for(j = 0; j < 784; j++) {
          image.setValue(j, i, tmp1.$(j, 0));
        }
        for(j = 0; j < 10; j++) {
          label.setValue(j, i, tmp2.$(j, 0));
        }
      }
      offset += batch;
      if(offset > trainData.count) {
        offset %= trainData.count;
        times += 1;
      }
      cost = nn.train(image, label);
      log.innerHTML = `image: ${times}, ${offset}/${trainData.count}\ncost: ${cost}\n`;
    }
  }, 1000);

})();