const fs = require('fs-extra');
const path = require('path');

async function emptyDir(folderPath) {
  console.log('emptyDir() invoked');
  try {
    await fs.emptyDir(folderPath);
    console.log(`Removed all files from dir: ${folderPath}`);
  } catch (err) {
    console.error(`emptyDir() error: ${err.message}`);
  }
}

async function moveFiles(srcFile, destFile) {
  console.log('moveFiles() invoked');
  try {
    // ensure srcFile exists
    const exists = await fs.pathExists(srcFile);
    if (!exists) {
      console.log(`An attempt to move a file that does not exist: ${srcFile}`);
    } else {
      await fs.move(srcFile, destFile);
      console.log(`Moved file from: ${srcFile}, to: ${destFile}`);
    }
  } catch (err) {
    console.error(`moveFiles() error: ${err.message}`);
  }
}

async function makeDirectory(folderPath) {
  console.log('makeDirectory() invoked');
  try {
    // 'fs.ensureDir' returns a complete path to the URL of the created directory
    await fs.ensureDir(folderPath);
  } catch (err) {
    console.error(`makeDirectory() error: ${err.message}`);
  }
}

async function deleteDirectory(folderPath) {
  try {
    await fs.remove(folderPath);
    console.log('Directory removed successfully!');
  } catch (err) {
    console.error(`deleteDirectory() error: ${err.message}`);
  }
}

async function deleteFile(pathToFile) {
  try {
    await fs.remove(pathToFile);
    console.log(`File removed: ${pathToFile}`);
  } catch (err) {
    console.error(`deleteFile() error: ${err.message}`);
  }
}

async function clearDirectory(folderPath) {
  try {
    // ensure 'folderPath' exists
    const exists = await fs.pathExists(folderPath);
    console.log('Directory exists:', exists);

    // remove files within the directory
    await fs.emptyDir(folderPath);
    console.log('Directory contents has been emptied.');
  } catch (error) {
    console.log(`clearDirectory() error: ${error.message}`);
  }
}

// Define a function to read image filenames from the directory
async function readImageFilenamesFromDirectory(directoryPath) {
  try {
    // Read the contents of the directory
    const files = await fs.readdir(directoryPath);

    // Filter the list of files to include only image files
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    const imageFilenames = files.filter(filename => {
      const extension = path.extname(filename).toLowerCase();
      return imageExtensions.includes(extension);
    });

    // Return the array of image filenames
    return imageFilenames;
  } catch (error) {
    console.error(`readImageFilenamesFromDirectory() error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  makeDirectory,
  clearDirectory,
  deleteDirectory,
  deleteFile,
  moveFiles,
  emptyDir,
  readImageFilenamesFromDirectory
};
