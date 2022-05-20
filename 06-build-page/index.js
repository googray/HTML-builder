const path = require('path');
const { promises: fsP } = require('fs');
const { stderr, stdout } = require('process');
const fs = require('fs');

const destDr = path.join(__dirname, 'project-dist');

const assetsDr = path.join(__dirname, 'assets');
const assetsDestDr = path.join(destDr, 'assets');

const stylesDr = path.join(__dirname, 'styles');
const bundleStyle = path.join(destDr, 'style.css');

const componentDr = path.join(__dirname, 'components');
const templateHtml = path.join(__dirname, 'template.html');
const indexHtml = path.join(destDr, 'index.html');

async function mergeCss(srcDr, bundleStyle) {
  try {
    const entries = await fsP.readdir(srcDr, { withFileTypes: true });
    const files = entries.filter((file) => !file.isDirectory());
    const writableStream = fs.createWriteStream(bundleStyle, 'utf-8');
    for (let file of files) {
      let srcFile = path.join(srcDr, file.name);
      let extensio = path.extname(srcFile);
      if (extensio === '.css') {
        let codeLines = '';
        const readableStream = fs.createReadStream(srcFile, 'utf-8');
        readableStream.on('data', (chunk) => (codeLines += chunk));
        readableStream.on('error', (error) =>
          console.error(`Error read file: ${error}`)
        );
        readableStream.on('end', () => {
          writableStream.write(codeLines);
        });
      }
    }
  } catch (err) {
    stderr.write(`Error bundle file: ${err}`);
  }
  // stdout.write('fales bandled');
}
//correctly does not work, separate on two func
// async function copyDir(srcDr, destDr) {
//   try {
//     await fs.mkdir(destDr, { recursive: true });
//     let entries = await fs.readdir(srcDr, {
//       withFileTypes: true,
//     });
//     console.log('entries', entries);
//     for (let file of entries) {
//       let srcPath = path.join(srcDr, file.name);
//       let destPath = path.join(destDr, file.name);

//       console.log('srcPath', srcPath);
//       console.log('destPath', destPath);

//       file.isDirectory()
//         ? await copyDir(srcPath, destPath)
//         : await fs.copyFile(srcPath, destPath);
//       stdout.write(`copy ${file.name} -> ${destPath}` + '\r\n');
//     }
//   } catch (err) {
//     stderr.write(`Error copy dir: ${err}`);
//   }
// }

async function copyFile(srcPath, destPath) {
  try {
    const files = await fsP.readdir(srcPath, { withFileTypes: true });
    for (let file of files) {
      let srcPathCopy = path.join(srcPath, file.name);
      let destPathCopy = path.join(destPath, file.name);

      // stdout.write(`copy ${file.name} to ${destPathCopy}`);

      if (file.isFile()) {
        try {
          await fsP.copyFile(srcPathCopy, destPathCopy);
        } catch (err) {
          stderr.write(`Error copy file: ${err}`);
        }
      } else {
        copyDir(srcPathCopy, destPathCopy);
      }
    }
  } catch (err) {
    stderr.write(`Error copy DR: ${err}`);
  }
}

async function copyDir(srcDr, destDr) {
  try {
    await fsP.rm(destDr, { recursive: true, force: true });

    try {
      await fsP.mkdir(destDr, { recursive: true });

      copyFile(srcDr, destDr);
    } catch (err) {
      stderr.write(`Error create dir: ${err}`);
    }
  } catch (err) {
    stderr.write(`Error remove dir: ${err}`);
  }
}

const components = [];

async function componentReader(srcFile) {
  return new Promise((res, rej) => {
    let codeLines = '';
    const readableStream = fs.createReadStream(srcFile, 'utf-8');
    readableStream.on('data', (chunk) => (codeLines += chunk));
    readableStream.on('error', (err) => rej(err));
    readableStream.on('end', () => {
      res({ name: path.basename(srcFile, '.html'), text: codeLines });
    });
  });
}

async function componentCreator(text, components, indexHtml) {
  components.forEach((component) => {
    text = text.split(`{{${component.name}}}`).join(component.text);
  });

  const writableStream = fs.createWriteStream(indexHtml, 'utf-8');
  writableStream.write(text);
  stdout.write(`write ${indexHtml}` + '\r\n');
}

const promises = [];
async function bundlerHtml(indexHtml, componentDr, templateHtml) {
  try {
    const entries = await fsP.readdir(componentDr, { withFileTypes: true });
    const files = entries.filter((file) => !file.isDirectory());
    for (let file of files) {
      const srcFile = path.join(componentDr, file.name);
      let extensio = path.extname(srcFile);
      if (extensio === '.html') {
        try {
          promises.push(componentReader(srcFile));
        } catch (err) {
          stderr.write(`Error components read: ${err}`);
        }
      }
    }

    Promise.allSettled(promises).then((results) => {
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          components.push(result.value);
        } else {
          stderr.write(`Error promise components: ${result.reason}`);
        }
      });
      const readableStream = fs.createReadStream(templateHtml, 'utf-8');
      let codeLines = '';

      readableStream.on('data', (chunk) => (codeLines += chunk));
      readableStream.on('error', (error) => console.error(`${error}`));
      readableStream.on('end', () =>
        componentCreator(codeLines, components, indexHtml)
      );
    });
  } catch (err) {
    stderr.write(`Error components read: ${err}`);
  }
}

async function buiderHtml() {
  try {
    await fsP.rm(destDr, { recursive: true, force: true });

    try {
      await fsP.mkdir(destDr, { recursive: true });
      await bundlerHtml(indexHtml, componentDr, templateHtml);
      await copyDir(assetsDr, assetsDestDr);
      await mergeCss(stylesDr, bundleStyle);
    } catch (err) {
      stderr.write(`Error create DR: ${err}`);
    }
  } catch (err) {
    stderr.write(`Error remove DR: ${err}`);
  }
}

buiderHtml();
