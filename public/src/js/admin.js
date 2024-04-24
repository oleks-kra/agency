import confirmDelete from './components/admin/confirmDelete';
import handleFormSubmit from './components/admin/handleFormSubmit';
import initTinyMCE from './components/admin/initTinyMCE';

document.addEventListener('DOMContentLoaded', function () {
  // CREATE/UPDATE ARTICLE
  const articleFormElem = document.getElementById('articleForm');
  if (articleFormElem && typeof window.tinymce !== 'undefined') {
    articleFormElem.addEventListener('submit', async function (e) {
      e.preventDefault();
      // Execute the editor.uploadImages() function BEFORE submitting the editor contents to the server to avoid storing images as Base64.
      try {
        // Upload images to a temporary location. 'result' returns an array of newly inserted images (old ones are ignored) that were just added to the article content, with image filename stored at '.uploadUri'
        // Old images that were loaded into the Editor on article's 'update' will not be part of the 'result'
        // If no images were embeded into the article, an empty array is returned
        const result = await window.tinymce.get('content').uploadImages();
        console.log('result of calling .uploadImages():', result);
        // store an array of filenames
        /*
        {
          uploadUrl: 'apple.jpg',
          element: {
            alt (String): alt attribute as set in TinyMCE editor
            title (String): title attribute as set in TinyMCE editor
            clientWidth (Number): image width as set in the Editor
            clientHeight (Number): image height as set in the Editor
          }
        }
        We can also grab image's ALT attribute and store it in the DB
        */
        const embededArticleFilenames = result.map(image => image.uploadUri);
        console.log('embededArticleFilenames:', embededArticleFilenames);
        // only when images upload is successful, store article into the database.
        await handleFormSubmit(
          'article',
          articleFormElem,
          'http://localhost:3000/api/v1/articles', // processing API URL
          'http://localhost:3000/admin/blog/articles', // return URL
          embededArticleFilenames
        );
      } catch (error) {
        console.log(`Error saving/updating the article: ${error.message}`);
      }
    });
  }

  // CREATE/UPDATE CATEGORY
  const categoryFormElem = document.getElementById('categoryForm');
  if (categoryFormElem) {
    categoryFormElem.addEventListener('submit', async function (e) {
      e.preventDefault();

      await handleFormSubmit(
        'category',
        categoryFormElem,
        'http://localhost:3000/api/v1/categories',
        'http://localhost:3000/admin/blog/categories'
      );
    });
  }

  // CONFIRM ARTICLE DELETION
  const deleteLinks = document.querySelectorAll('.delete');
  deleteLinks.forEach(function (link) {
    link.addEventListener('click', confirmDelete);
  });

  // INITIALIZE TINYMCE RICH TEXT EDITOR
  initTinyMCE();
});
