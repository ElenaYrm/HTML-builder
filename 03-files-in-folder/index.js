const path = require('path');
const { readdir, open } = require('node:fs/promises');
const { stdout } = process;

const folderPath = path.join(__dirname, 'secret-folder');

async function getData(targetPath) {
  try {
    const files = await readdir(targetPath, {  withFileTypes: true});
    for (const file of files) {
      if (file.isFile()) {
        const name = file.name.slice(0, file.name.indexOf('.'));
        const extname = path.extname(file.name).slice(1);
        const fd = await open(path.join(targetPath, file.name), 'r');
        const size = await fd.stat();
        stdout.write(`${name} - ${extname} - ${size.size}b` + '\n');
      }
    }
  } catch (error) {
    stdout.write(error.message);
  }
}

getData(folderPath);
