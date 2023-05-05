const path = require('path');
const fs = require('fs');
const { copyFile, mkdir, readdir, rm } = require('node:fs/promises');
const { stdout } = process;

const resultFolder = path.join(__dirname, 'project-dist');
mkdir(resultFolder, { recursive: true })
  .then(async () => {
    await rm(path.join(resultFolder), { recursive: true, force: true });
  })
  .then(async () => {
    await copyFiles(path.join(__dirname, 'assets'), path.join(resultFolder, 'assets'));
  })
  .then(async () => {
    await createBundleCss(path.join(__dirname, 'styles'), path.join(resultFolder, 'style.css'));
  })
  .then(async () => {
    await createHTMLFile(
      path.join(__dirname, 'template.html'),
      path.join(resultFolder, 'index.html'),
      path.join(__dirname, 'components'));
  })
  .catch((error) => {
    stdout.write(error.message);
  });

async function createBundleCss(stylesPath, bundleFile) {
  // check files in the folder and read .css files
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

  // write the common file to styles
  await fs.writeFile(bundleFile, info.map(item => JSON.parse(item)).join('\n'), (err) => {
    if (err) throw err;
  });
}

async function copyFiles(existPath, targetPath) {
  // create new folder
  await mkdir(targetPath, { recursive: true });

  // read exist folder and check if it is a file or folder and copy file
  const files = await readdir(existPath, {  withFileTypes: true});
  for (const file of files) {
    if (file.isFile()) {
      await copyFile(path.join(existPath, file.name), path.join(targetPath, file.name));
    } else {
      await copyFiles(path.join(existPath, file.name), path.join(targetPath, file.name));
    }
  }
}

async function createHTMLFile(curFile, newFilePath, componentsPath) {
  // read components to know number and names of files and read the content of this files
  const components = [];
  const files = await readdir(componentsPath);
  for (const file of files) {
    components.push(new Promise((resolve, reject) => {
      fs.readFile(path.join(componentsPath, file), 'utf-8', (error, data) => {
        if (error) return reject(error);
        return resolve(data);
      });
    }));
  }
  const result = await Promise.all(components);

  // read the template and replace temp lines to the context of components
  await fs.readFile(curFile, async (err, data) => {
    if (err) throw err;
    let dataStringify = data.toString();
    for (let i = 0; i < files.length; i++) {
      const searchValue = `{{${files[i].slice(0, files[i].indexOf('.'))}}}`;
      if (dataStringify.includes(searchValue)) {
        dataStringify = dataStringify.replace(searchValue, result[i]);
      }
    }

    // write the result of reading to a new file
    await fs.writeFile(newFilePath, dataStringify, (err) => {
      if (err) throw err;
    });
  });
}
