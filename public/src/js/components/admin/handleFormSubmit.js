import callApiAndRedirect from './callApiAndRedirect';

async function handleFormSubmit(
  resource,
  formElem,
  apiEndpointBase,
  returnUrl,
  embededArticleImages
) {
  console.log('handleFormSubmit() invoked');
  const formData = new FormData();
  if (resource === 'article') {
    formData.append('title', formElem.querySelector('#title').value);
    formData.append(
      'metaDescription',
      formElem.querySelector('#metaDescription').value
    );
    formData.append('summary', formElem.querySelector('#summary').value);
    // 'tinymce.get()' - Returns an editor instance for a given id.
    // '.getContent()' - Gets the content from the editor instance
    let articleHTML = tinymce.get('content').getContent();
    // escape HTML coming from tinyMCE
    articleHTML = encodeURIComponent(articleHTML);
    formData.append('content', articleHTML);
    // 'embededArticleImages' is an array of filenames (or an empty array), but .append() takes only values of type String, so I stringify it.
    formData.append(
      'embededArticleImages',
      JSON.stringify(embededArticleImages)
    );
    // The files property of an <input type="file"> element is a FileList object containing all the files selected by the user. Even though you might only allow the selection of one file in your input element, the 'files' property still holds an array-like object of all selected files.
    formData.append(
      'featuredImage',
      formElem.querySelector('#featuredImage').files[0]
    );
  }
  if (resource === 'category') {
    formData.append('title', formElem.querySelector('#title').value);
    formData.append(
      'metaDescription',
      formElem.querySelector('#metaDescription').value
    );
    formData.append(
      'description',
      formElem.querySelector('#description').value
    );
  }

  const itemId = formElem.querySelector('#itemId').value;
  // create or update?
  const action = formElem.dataset.action;

  // only when a resource gets updated
  if (action === 'update') {
    // if 'published' field is part of the submitted form, update its published status
    formElem.querySelector('#published') &&
      formData.append(
        'published',
        formElem.querySelector('#published').checked
      );

    // process category checkboxes
    let categoryCheckboxes = Array.from(
      formElem.querySelectorAll('input[name="categories[]"]')
    );
    categoryCheckboxes = categoryCheckboxes
      .map(checkbox => {
        if (checkbox.checked) {
          return checkbox.value;
        }
      })
      .filter(Boolean);
    // update article's 'categories' path; an empty array [] for the 'categories' will result in unassigning article from all categories.
    // FormData.set() expends to value to be of type string, and if an array is passed, it converts it into a string. To ensure our API endpoint does not throw Cast errors, we have to turn it into a string before added the field to the formData
    formData.set('categories', JSON.stringify(categoryCheckboxes));
  }

  // prepare data to make an API call
  let apiEndpoint;
  let httpMethod;
  if (action === 'create') {
    apiEndpoint = apiEndpointBase;
    httpMethod = 'post';
  } else {
    // 'action' is an 'update'
    apiEndpoint = `${apiEndpointBase}/${itemId}`;
    // has to be in all uppercase; otherwise won't work
    httpMethod = 'PATCH';
  }
  await callApiAndRedirect(formData, apiEndpoint, httpMethod, returnUrl);
}

export default handleFormSubmit;
