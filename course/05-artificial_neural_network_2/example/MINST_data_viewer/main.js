(function() {
  //origin binary file
  let data = {
    tag: null,
    contents: null,
    count: 0,
    width: 0,
    height: 0,
  };
  //show index
  let imageIndex = 0;
  //node
  let canvas = document.getElementsByTagName("canvas")[0];
  let context = canvas.getContext('2d');
  //let output = document.getElementsByTagName("div")[0];
  let input = document.getElementsByTagName("input")[0];
  let preShow = document.getElementsByTagName("button")[0];
  let nextShow = document.getElementsByTagName("button")[1];

  //loader file
  input.onchange = function() {
    let blob = null;
    let file = this.files[0];
    let fileReader = new FileReader();
    fileReader.onprogress = function() {
      //output.innerHTML = Math.floor(event.loaded / event.total * 100);
    };
    fileReader.onload = function() {
      data.contents = new DataView(event.target.result);
      //get header
      data.tag = data.contents.getInt32(0);
      data.count = data.contents.getInt32(4);
      data.width = data.contents.getInt32(8);
      data.height = data.contents.getInt32(12);
      //reset canvas
      canvas.width = data.width;
      canvas.height = data.height;
      //show init.
      show(0);
    };
    blob = file.slice(0, file.size);
    fileReader.readAsArrayBuffer(blob);
  };

  //show image
  let show = function(imageIndex) {
    var imageData = new ImageData(data.width, data.height);
    let offset = 16 + imageIndex * (data.width * data.height);
    for(let y = 0; y < data.height; y++) {
      for(let x = 0; x < data.width; x++) {
        let index = y * data.width + x;
        for(let z = 0; z < 4; z++) {
          imageData.data[index * 4 + z] = z === 3 ? 255 : data.contents.getUint8(offset + index);
        }
      }
    }
    context.putImageData(imageData, 0, 0);
  };

  //show click
  preShow.onclick = function() {
    if(imageIndex > 0) {
      imageIndex--;
      show(imageIndex);
    }
  };
  
  nextShow.onclick = function() {
    if(imageIndex < data.count) {
      imageIndex++;
      show(imageIndex);
    }
  };

})();