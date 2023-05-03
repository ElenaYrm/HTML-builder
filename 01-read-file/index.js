const fs = require('fs');
const path = require('path');
const { stdout } = process;

const file = path.join(__dirname, 'text.txt');
const input = fs.createReadStream(file, 'utf-8');

input.on('data', data => {
  stdout.write(data);
});
