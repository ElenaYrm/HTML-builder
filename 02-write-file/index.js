const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

const filePath = path.join(__dirname, 'text.txt');
fs.appendFile(filePath, '', (err) => {
  if (err) throw err;
  stdout.write('How was your day?' + '\n');
});

function exitMessage() {
  stdout.write('See you next time, bye!');
  process.exit();
}

stdin.on('data', data => {
  const dataStringified = data.toString();
  if (dataStringified.trim() === 'exit') {
    exitMessage();
  } else {
    fs.appendFile(filePath, dataStringified, (err) => {
      if (err) throw err;
    });
  }
});

process.on('SIGINT', exitMessage);
