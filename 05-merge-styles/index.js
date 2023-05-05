const path = require('path');
const fs = require('fs');
const { readdir } = require('node:fs/promises');
const { stdout } = process;

const stylesFolderPath = path.join(__dirname, 'styles');
const resultFolderPath = path.join(__dirname, 'project-dist');
const resultFile = path.join(resultFolderPath, 'bundle.css');

async function createBundleCss(stylesPath, bundleFile) {
  try {
    const promises = [];
    const files = await readdir(stylesPath, {  withFileTypes: true});
    for (const file of files) {
      if (file.isFile()) {
        if (path.extname(file.name) === '.css') {
          promises.push(new Promise((resolve, reject) => {
            fs.readFile(path.join(stylesPath, file.name), 'utf-8', (error, data) => {
              if (error) return reject(error);
              return resolve(JSON.stringify(data));
            });
          }));
        }
      }
    }
    const info = await Promise.all(promises);
    await fs.writeFile(bundleFile, info.map(item => JSON.parse(item)).join('\n'), (err) => {
      if (err) throw err;
    });
  } catch (error) {
    stdout.write(error.message);
  }
}

createBundleCss(stylesFolderPath, resultFile);
