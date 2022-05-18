const path = require('path');
const { promises: fsP } = require('fs');
const { stderr, stdout } = require('process');
const fs = require('fs');

const srcDr = path.join(__dirname, 'styles');
const destDr = path.join(__dirname, 'project-dist');
const bundleFile = 'bundle.css';

async function mergeCss() {
  try {
    const entries = await fsP.readdir(srcDr, { withFileTypes: true });
    const files = entries.filter((file) => !file.isDirectory());
    const destFile = path.join(destDr, bundleFile);
    const writableStream = fs.createWriteStream(destFile, 'utf-8');
    for (let file of files) {
      let srcFile = path.join(srcDr, file.name);
      let extensio = path.extname(srcFile);
      if (extensio === '.css') {
        let codeLines = '';
        const readableStream = fs.createReadStream(srcFile, 'utf-8');
        readableStream.on('data', (chunk) => (codeLines += chunk));
        readableStream.on('error', (error) => console.error(`${error}`));
        readableStream.on('end', () => {
          writableStream.write(codeLines);
        });
      }
    }
  } catch (err) {
    stderr.write(`${err}`);
  }
  stdout.write('fales bandled');
}
mergeCss();
