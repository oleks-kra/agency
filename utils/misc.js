const { readImageFilenamesFromDirectory } = require('./fileSystem');

function sortArrayOfObjectsByProp(arr, prop, direction = 'asc') {
  const sortedArr = [...arr];
  sortedArr.sort((objA, objB) => {
    if (direction === 'asc') {
      return objA[prop] - objB[prop];
    }
    return objB[prop] - objA[prop];
  });
  return sortedArr;
}

function createUniqueImageFilename(baseName) {
  const uniqueId = Math.random().toString(36).substring(2, 6); // Generate a random string
  const msString = new Date().getUTCMilliseconds(); // Get milliseconds
  return `${msString}-${uniqueId}-${baseName.split('.')[0]}.jpg`;
}

// 'arr' is a reference to an array of newly added locatl image filenames
async function addMissingImagesFromTemp(
  filenamesInArticleHtml,
  arr,
  tempFolderPath
) {
  const embededArticleFilenames = [...arr];
  console.log('filenamesInArticleHtml:', filenamesInArticleHtml);
  console.log('embededArticleFilenames:', embededArticleFilenames);
  const filenamesInTempDir =
    await readImageFilenamesFromDirectory(tempFolderPath);

  console.log('filenamesInTempDir:', filenamesInTempDir);

  const extraToAdd = [];
  filenamesInArticleHtml.forEach(filename => {
    if (
      !embededArticleFilenames.includes(filename) &&
      filenamesInTempDir.includes(filename)
    ) {
      embededArticleFilenames.push(filename);
      extraToAdd.push(filename);
    }
  });
  console.log('extraToAdd:', extraToAdd);
  return embededArticleFilenames;
}

module.exports = {
  sortArrayOfObjectsByProp,
  createUniqueImageFilename,
  addMissingImagesFromTemp
};
