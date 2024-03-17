import confirmDelete from './components/admin/confirmDelete';
import handleFormSubmit from './components/admin/handleFormSubmit';

document.addEventListener('DOMContentLoaded', function () {
  // CREATE/UPDATE ARTICLE
  const articleFormElem = document.getElementById('articleForm');
  if (articleFormElem) {
    articleFormElem.addEventListener('submit', async function (e) {
      e.preventDefault();
      await handleFormSubmit(
        'article',
        articleFormElem,
        'http://localhost:3000/api/v1/articles',
        'http://localhost:3000/admin/blog/articles'
      );
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
});
