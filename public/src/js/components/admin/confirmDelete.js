import { notifyUser } from './notifications';
import deleteResource from './deleteResource';

// show the 'delete' link and remove the 'delete confirmation' form
function cancelResourceRemoval(formElem) {
  // show the 'delete' link
  formElem.parentElement.querySelector('.delete').style.display = 'block';
  // remove the delete form
  formElem.remove();
}

function createDeleteForm(resourceType, pass, resourceId, parentElem) {
  console.log('createDeleteForm() invoked.');
  // if a delete form is shown, remove it before creating a new one
  const deleteForm = document.getElementById('confirm');
  deleteForm && cancelResourceRemoval(deleteForm);

  // create form element
  const formElem = document.createElement('form');
  formElem.setAttribute('id', 'confirm');

  // create input element
  const passInputElem = document.createElement('input');
  passInputElem.setAttribute('type', 'text');
  passInputElem.setAttribute('id', 'pass');
  passInputElem.setAttribute('name', 'pass');
  passInputElem.setAttribute('placeholder', `Type '${pass}'`);

  // create confirm button
  const confirmBtn = document.createElement('button');
  confirmBtn.setAttribute('type', 'submit');
  confirmBtn.textContent = 'Confirm';

  // create cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';

  // append form's children
  formElem.appendChild(passInputElem);
  formElem.appendChild(confirmBtn);
  formElem.appendChild(cancelBtn);

  // append the form to parent element
  parentElem.appendChild(formElem);

  // listen for form 'submit'
  formElem.addEventListener('submit', function (e) {
    e.preventDefault();
    if (pass !== formElem.querySelector('#pass').value) {
      console.log('Incorrect confirmation code');
      // display error message
      notifyUser(
        'error',
        `Incorrect confirmation code. Expected value: '${pass}'`
      );
      return;
    }
    console.log('Correct password. Proceed with deletion.');

    switch (resourceType) {
      case 'article':
        deleteResource(
          'article',
          resourceId,
          'http://localhost:3000/admin/blog/articles'
        );
        break;
      case 'category':
        deleteResource(
          'category',
          resourceId,
          'http://localhost:3000/admin/blog/categories'
        );
        break;
      default:
        console.log(`deleteResource function requires resourceType`);
    }
  });

  // listen for 'cancel' button click
  cancelBtn.addEventListener('click', function (e) {
    e.preventDefault();
    // hide confirm form
    cancelResourceRemoval(this.form);
  });
}

export default function confirmDelete(e) {
  console.log('confirmDelete() invoked');
  e.preventDefault();
  const linkElem = e.target;
  const pass = linkElem.dataset.pass;
  const resourceId = linkElem.dataset.resourceId;
  // 'resourceType' is either 'category' or 'article' and determines which API is being called
  const resourceType = linkElem.dataset.resourceType;
  // 1. Hide the link
  linkElem.style.display = 'none';

  // 2. Display html form, and show expected value in placeholder attribute
  createDeleteForm(resourceType, pass, resourceId, linkElem.parentElement);
}
