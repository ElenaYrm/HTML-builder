const path = require('path');
const { mkdir, copyFile, readdir, unlink } = require('node:fs/promises');
const { stdout } = process;

const existFolderPath = path.join(__dirname, 'files');
const newFolderPath = path.join(__dirname, 'files-copy');

async function getData(existPath, targetPath) {
  try {
    await mkdir(targetPath, { recursive: true });
    const prevFiles = await readdir(targetPath, {  withFileTypes: true});
    if (prevFiles) {
      for (const file of prevFiles) {
        await unlink(path.join(targetPath, file.name));
      }
    }

    const files = await readdir(existPath, {  withFileTypes: true});
    for (const file of files) {
      await copyFile(path.join(existPath, file.name), path.join(targetPath, file.name));
    }
  } catch (error) {
    stdout.write(error.message);
  }
}

getData(existFolderPath, newFolderPath);
