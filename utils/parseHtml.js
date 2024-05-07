const { JSDOM } = require('jsdom');
const { sortArrayOfObjectsByProp } = require('./misc');

function generateSrcsetAttr(imagePath, sizes) {
  // make sure media queries appear in the ascending order
  const sortedAsc = sortArrayOfObjectsByProp(sizes, 'width');
  return sortedAsc
    .map(size => `${imagePath}/${size.flnm} ${size.width}w`)
    .join(', ');
}

function generateSizesAttr(sizes) {
  const sortedAsc = sortArrayOfObjectsByProp(sizes, 'width');
  return sortedAsc
    .map((size, index, array) => {
      // if it is not the last array element we are looping through
      if (index < array.length - 1) {
        return `(max-width: ${size.width}px) ${size.width}px`;
      }
      return `${size.width}px`;
    })
    .join(', ');
}

function createCoverImage(path, articleCoverDoc) {
  console.log('createCoverImage() invoked');
  const srcset = generateSrcsetAttr(path, articleCoverDoc.sizes);
  const sizes = generateSizesAttr(articleCoverDoc.sizes);
  const src = `${path}/${articleCoverDoc.filename}`;
  const width = process.env.ARTICLE_FEATURED_IMAGE_WIDTH;
  const { height } = articleCoverDoc;
  return `<img width="${width}" height="${height}" src="${src}" srcset="${srcset}" sizes="${sizes}">`;
}

// 'htmlContent' is un-escaped HTML that contains image tags whose value is just the filename
// 'imagePath' is the location of the folder where images for the current article are stored
function replaceImagePaths(htmlContent, imagePath, embededImages) {
  // Parse the HTML content using jsdom
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // Get all img elements
  const imgElements = document.querySelectorAll('img');

  // Iterate over each img element and replace src attribute
  imgElements.forEach(img => {
    // Get the current src attribute value, which is just the filename
    const src = img.getAttribute('src');
    // Prefix path to where article's images are stored to the filename
    img.setAttribute('src', `${imagePath}/${src}`);
    // ADD RESPONSIVE IMAGE ATTRIBUTES
    const matchedImage = embededImages.find(image => image.filename === src);
    if (matchedImage && matchedImage.sizes.length > 1) {
      const srcsetAttr = generateSrcsetAttr(imagePath, matchedImage.sizes);
      img.setAttribute('srcset', srcsetAttr);
      const sizesAttr = generateSizesAttr(matchedImage.sizes);
      img.setAttribute('sizes', sizesAttr);
    }
  });

  // Return the updated HTML content
  return document.documentElement.outerHTML;
}

function parseEmbeddedImagesFromHTML(htmlContent) {
  // Parse the HTML content using jsdom
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;
  // Get all img elements
  const imgElements = Array.from(document.querySelectorAll('img'));
  return imgElements.map(img => img.getAttribute('src'));
}

module.exports = {
  replaceImagePaths,
  parseEmbeddedImagesFromHTML,
  createCoverImage
};
