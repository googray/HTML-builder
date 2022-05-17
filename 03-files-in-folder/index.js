const fs = require('fs');
const path = require('path');
const dir = 'secret-folder';
const folderPath = path.join(__dirname, dir);
const { stdout, stderr } = require('process');
const { promises: fsP } = require('fs');

(async function getFiles(err) {
  try {
    const entries = await fsP.readdir(folderPath, { withFileTypes: true });
    const files = entries.filter((file) => !file.isDirectory());
    for (let file of files) printFileData(file);
  } catch {
    stderr.write(`${err}`);
  }
})();

const printFileData = (file) => {
  const folderPath = path.join(__dirname, dir, file.name);

  fs.stat(folderPath, (err, stats) => {
    if (err) stderr.write(`${err}`);
    else if (stats.isFile) {
      let extensio = path.extname(folderPath).slice(1);
      let data = `${file.name} - ${extensio} - ${stats.size / 1024}kb`;
      stdout.write(data + '\r\n');
    }
  });
};
