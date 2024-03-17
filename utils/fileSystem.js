const fs = require('fs-extra');

async function makeDirectory(folderPath) {
  console.log('makeDirectory() invoked');
  try {
    // 'fs.ensureDir' returns a complete path to the URL of the created directory
    await fs.ensureDir(folderPath);
  } catch (err) {
    console.error(err);
  }
}

async function deleteDirectory(folderPath) {
  try {
    await fs.remove(folderPath);
    console.log('Directory removed successfully!');
  } catch (err) {
    console.error(`Error: ${err.message}`);
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
    console.log(`Error: ${error.message}`);
  }
}

module.exports = { makeDirectory, clearDirectory, deleteDirectory };
