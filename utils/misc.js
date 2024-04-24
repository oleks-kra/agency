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

module.exports = { sortArrayOfObjectsByProp, createUniqueImageFilename };
