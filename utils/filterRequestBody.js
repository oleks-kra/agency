function filterRequestBody(requestBody, ...props) {
  const filtered = {};
  props.forEach(prop => {
    // keep condition as is, or updating article's 'published' status won't work
    if (requestBody[prop] !== undefined) filtered[prop] = requestBody[prop];
  });
  return filtered;
}

module.exports = { filterRequestBody };
