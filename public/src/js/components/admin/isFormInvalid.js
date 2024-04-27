import {
  notifyUser,
  highlightFormErrorElem,
  resetElemValue
} from './notifications';

function isFormInvalid(formElem, editorInstance) {
  // return 'true' if validation error is encountered

  // TITLE (not empty)
  const titleElem = formElem.querySelector('#title');
  if (titleElem && titleElem.value.trim() === '') {
    highlightFormErrorElem(titleElem, 'formErrorElem');
    resetElemValue(titleElem);
    notifyUser('error', 'Article "title" cannot be empty.');
    return true;
  }

  // CONTENT (not empty string)
  const editorContentAsText = editorInstance.getContent({ format: 'text' });
  const editorContainer = editorInstance.container;
  if (editorContentAsText.trim() === '') {
    highlightFormErrorElem(editorContainer, 'formErrorElem');
    editorInstance.setContent('');
    notifyUser('error', 'Article "content" cannot be empty.');
    return true;
  }

  // MAX LENGTH CHECKS
  const otherElems = formElem.querySelectorAll('[data-track="length"]');
  let fieldName = '';
  for (const elem of otherElems) {
    const maxLength = Number(elem.getAttribute('maxlength'));
    if (elem.value.trim().length > maxLength) {
      switch (elem.getAttribute('id')) {
        case 'metaTitle':
          fieldName = 'Meta title';
          break;
        case 'metaDescription':
          fieldName = 'Meta description';
          break;
        default:
          fieldName = 'Undefined';
          console.log('Undefined "switch" case.');
          break;
      }
      highlightFormErrorElem(elem, 'formErrorElem');
      notifyUser(
        'error',
        `${fieldName} must be ${maxLength} characters long or shorter.`
      );
      return true;
    }
  }
  return false;
}

export default isFormInvalid;
