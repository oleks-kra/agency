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

module.exports = { sortArrayOfObjectsByProp };
