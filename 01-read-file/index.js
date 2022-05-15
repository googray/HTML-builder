const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'text.txt');
let stream = new fs.ReadStream(file, 'utf-8');

stream.on('readable', function () {
  let data = stream.read();
  console.log(data);
});
