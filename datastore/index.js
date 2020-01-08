const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
      if (err) {
        throw err;
      } else {
        callback(null, {id, text});
      }
    });
  });
};

exports.readAll = (callback) => {
  // var data = _.map(items, (text, id) => {
  //   return { id, text };
  // });
  // callback(null, data);
  var readPromise = Promise.promisify(fs.readFile);
  fs.readdir(exports.dataDir, (err, fileNames) => {
    if (err) {
      // throw err;
     throw ('err');
    }
    var data = _.map(fileNames, (file) => {
      var id = path.basename(file, '.txt');
      var filePath = path.join(exports.dataDir, file);
      return readPromise(filePath).then(fileData => {
        return {
          id: id,
          text: fileData.toString()
        };
      });
    });
    Promise.all(data)
      .then(items =>
        callback(null, items), err => callback(err));
      });
  };
  // } else {
  //   fileNames.forEach(file => {
  //     var fileObj = {};
  //     var lastFour = file.length - 4;
  //     var shortened = file.slice(0, lastFour);
  //     fileObj['id'] = shortened;
  //     fileObj['text'] = shortened;
  //     fileArray.push(fileObj);
  //   });
  //   callback(null, fileArray);
  //   // console.log('first', fileArray);
  //   return fileArray;



exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      var text = data.toString();
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
  var path = `${exports.dataDir}/${id}.txt`;
  fs.readFile(path, (err, data) => {
    if (err) {
      // callback(new Error(`No item with id: ${id}`));
      callback(err);
    } else {
      fs.writeFile(path, text, (err) => {
        if (err) {
          // callback(new Error(`No item with id: ${id}`));
          callback(err);
        } else {
          callback(null, {id, text}); // {id: id, text: text}
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  var path = `${exports.dataDir}/${id}.txt`;
  fs.readFile(path, (err, id) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.unlink(path, (err) => {
        if (err) {
          callback(new Error('could not delete file'));
        } else {
          callback(null, {id});
        }
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
