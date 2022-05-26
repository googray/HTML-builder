const { promises: fs } = require('fs');
const path = require('path');
const { stderr } = require('process');

const srcDr = path.join(__dirname, 'files');
const destDr = path.join(__dirname, 'files-copy');

async function copyDir(srcDr, destDr) {
  try {
    await fs.rm(destDr, { recursive: true, force: true });
    try {
      await fs.mkdir(destDr, { recursive: true });
      let entries = await fs.readdir(srcDr, {
        withFileTypes: true,
      });

      for (let file of entries) {
        let srcPath = path.join(srcDr, file.name);
        let destPath = path.join(destDr, file.name);

        file.isDirectory()
          ? await copyDir(srcPath, destPath)
          : await fs.copyFile(srcPath, destPath);
      }
    } catch (err) {
      stderr.write(`${err}`);
    }
  } catch (err) {
    stderr.write(`Error remove DR: ${err}`);
  }
}

copyDir(srcDr, destDr);
