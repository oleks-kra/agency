import slugify from 'slugify';
import {
  notifyUser,
  highlightFormErrorElem,
  deleteNotification,
  clearFormErrorHighlights
} from './notifications';

/*
'elem' - html form element with '.value' attribute
'fieldName' - MongoDB path name whose value must be unique
'apiBase' - URL of the API endpoint
*/
export default function ensureUniqueField(elem, fieldName, apiBase) {
  console.log('ensureUniqueField() invoked');

  elem.addEventListener('blur', async function () {
    const fieldValue = elem.value.trim();
    const slug = slugify(fieldValue, { lower: true });
    const response = await fetch(`${apiBase}/${slug}`);
    // read response body as JSON
    const responseBody = await response.json();
    const matchedDocFound = responseBody.data.doc ? true : false;
    // Title is only duplicate when the value of 'id' of the matchedDocFound is different from one we are editing
    if (
      matchedDocFound &&
      !window.location.pathname.includes(responseBody.data.doc.id)
    ) {
      // display error message
      notifyUser(
        'error',
        `A document with ${fieldName} "${fieldValue}" already exists.`
      );
      // highlight the field
      highlightFormErrorElem(this, 'formErrorElem');
      // disable submit button
      this.form.querySelector('[type="submit"]').disabled = true;
    } else {
      deleteNotification('notification');
      clearFormErrorHighlights(this, 'formErrorElem');
      this.form.querySelector('[type="submit"]').disabled = false;
    }
  });
}
