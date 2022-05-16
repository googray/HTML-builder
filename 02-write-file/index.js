const fs = require('fs');
const path = require('path');
const readline = require('readline');

fs.writeFile(path.join(__dirname, 'note.txt'), 'Task 02', (err) => {
  if (err) throw err;
  console.log('Hello! Please enter new data into the file.');
});

const listenerLine = (input) => {
  if (input === 'exit' || input === 'SIGINT') {
    process.exit();
  } else {
    writeToFile.write(input + '\r\n');
  }
};

const listenerExit = () => {
  rl.write('Text saved into the file. Buy!');
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const writeToFile = fs.createWriteStream(
  path.join(__dirname, 'note.txt'),
  'utf-8',
  { flags: 'a' }
);

rl.on('line', listenerLine);
process.on('exit', listenerExit);
