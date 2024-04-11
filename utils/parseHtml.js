const { JSDOM } = require('jsdom');

function replaceImagePaths(htmlContent, imagePath) {
  // Parse the HTML content using jsdom
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // Get all img elements
  const imgElements = document.querySelectorAll('img');

  // Iterate over each img element and replace src attribute
  imgElements.forEach(img => {
    // Get the current src attribute value
    let src = img.getAttribute('src');
    // Prefix the src with the provided image path
    src = `${imagePath}/${src}`;
    // Set the updated src attribute value
    img.setAttribute('src', src);
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
