const { JSDOM } = require('jsdom');
const { sortArrayOfObjectsByProp } = require('./misc');

/*
'sizes' is an array of objects, each of which includes: 
{
  width: 480,
  flnm: "856-hl5u-large-480w.webp"
}
srcset="
elva-480w.jpg 480w, 
elva-600w.jpg 600w, 
elva-800w.jpg 800w"
elva-1200w.jpg 1200w"
*/

function generateSrcsetAttr(imagePath, sizes) {
  // make sure media queries appear in the ascending order
  const sortedAsc = sortArrayOfObjectsByProp(sizes, 'width');
  return sortedAsc
    .map(size => `${imagePath}/${size.flnm} ${size.width}w`)
    .join(', ');
}

/*
  sizes="
(max-width: 480px) 480px,
(max-width: 600px) 600px,
(max-width: 800px) 800px,
1200px"
*/
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

module.exports = { replaceImagePaths, parseEmbeddedImagesFromHTML };
