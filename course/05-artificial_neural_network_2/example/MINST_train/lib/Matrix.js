function Matrix(row, column, callback) {
  this._row = row;
  this._column = column;
  this._value = Array.from({length: row}, function() {
    return Array.from({length: column}, (callback ? callback : function() {
      return 0;
    }));
  });
}

Matrix.prototype.set = function(array) {
  if(!array
  || array.length != this.getRow()
  || array[0].length != this.getColumn()) {
    let size = this.getSizeString();
    throw `Error size for set!(${size})`;
  }
  else {
    array.map(function(subArray, row){
      subArray.map(function(value, column) {
        this.setValue(row, column, value);
      }, this);
    }, this);
  }
};

Matrix.prototype.getRow = function() {
  return this._row;
};

Matrix.prototype.getColumn = function() {
  return this._column;
};

Matrix.prototype.getSize = function() {
  return this.getRow() * this.getColumn();
};

Matrix.prototype.$ = function(x, y) {
  return this.getValue(x, y);
};

Matrix.prototype.getValue = function(x, y) {
  if(x > this._row || y > this._column) {
    throw `Error range for matrix!`;
  }
  else {
    return this._value[x][y];
  }
};

Matrix.prototype.setValue = function(x, y, value) {
  if(x > this._row || y > this._column) {
    throw `Error range for matrix!`;
  }
  else {
    this._value[x][y] = value;
  }
};

Matrix.prototype.rowSame = function(matrix) {
  return matrix.getRow() === this.getRow();
};

Matrix.prototype.columnSame = function(matrix) {
  return matrix.getColumn() === this.getColumn();
};

Matrix.prototype.sizeSame = function(matrix) {
  return this.rowSame(matrix) && this.columnSame(matrix);
};

Matrix.prototype.canMultiply = function(matrix) {
  return this.getColumn() === matrix.getRow();
};

Matrix.prototype.getSizeString = function() {
  let row = this.getRow();
  let column = this.getColumn();
  return `${row}x${column}`;
};

Matrix.prototype.forEach = function(callback, self) {
  this._value.forEach(function(row, i) {
    row.forEach(function(e, j) {
      callback.call(this, e, i, j);
    }, self);
  }, self);
};

Matrix.prototype.map = function(callback, self) {
  let result = new Matrix(this.getRow(), this.getColumn());
  let tmp = this._value.map(function(row, i) {
    return row.map(function(e, j) {
      return callback.call(this, e, i, j);
    }, self);
  }, self);
  result.set(tmp);
  return result;
};

Matrix.prototype.addition = function(matrix) {
  if(this.sizeSame(matrix)) {
    return this.map(function(x, row, column){
      return x + matrix.$(row, column);
    });
  }
  else {
    let aSize = this.getSizeString();
    let bSize = matrix.getSizeString();
    throw `Error size for addtion.(${aSize}, and ${bSize})`;
  }
};

Matrix.prototype.subtract = function(matrix) {
  if(this.sizeSame(matrix)) {
    return this.map(function(x, row, column){
      return x - matrix.$(row, column);
    });
  }
  else {
    let aSize = this.getSizeString();
    let bSize = matrix.getSizeString();
    throw `Error size for subtract.(${aSize}, and ${bSize})`;
  }
};

Matrix.prototype.dotMultiply = function(matrix) {
  if(this.sizeSame(matrix)) {
    return this.map(function(x, row, column){
      return x * matrix.$(row, column);
    });
  }
  else {
    let aSize = this.getSizeString();
    let bSize = matrix.getSizeString();
    throw `Error size for dotMultiply.(${aSize}, and ${bSize})`;
  }
}

Matrix.prototype.multiply = function(matrix) {
  if(this.canMultiply(matrix)) {
    let result = new Matrix(this.getRow(), matrix.getColumn());
    for(let k = 0; k < this.getColumn(); k++) {
      for(let i = 0; i < this.getRow(); i++) {
        for(let j = 0; j < matrix.getColumn(); j++) {
          let value = result.$(i, j) + this.$(i, k) * matrix.$(k, j);
          result.setValue(i, j, value);
        }
      }
    }
    return result;
  }
  else {
    let aSize = this.getSizeString();
    let bSize = matrix.getSizeString();
    throw `Error size for multiply.(${aSize}, and ${bSize})`;
  }
};

Matrix.prototype.transpose = function() {
  let result = new Matrix(this.getColumn(), this.getRow());
  this.forEach(function(e, i, j) {
    result.setValue(j, i, e);
  });
  return result;
};

Matrix.prototype.toRowVector = function() {
  let result = new Matrix(1, this.getRow() * this.getColumn());
  let columnCount = this.getColumn();
  this.forEach(function(e, i, j) {
    let index = i * columnCount + j;
    result.setValue(0, index, e);
  });
  return result;
};

Matrix.prototype.toColumnVector = function() {
  return this.toRowVector().transpose();
};