function deleteNotification() {
  const notification = document.getElementById('notification');
  if (notification) notification.remove();
}

function notifyUser(status, msg) {
  deleteNotification();
  const element = document.createElement('div');
  element.setAttribute('id', 'notification');
  element.setAttribute('class', status);
  element.textContent = msg;
  document.body.insertAdjacentElement('afterbegin', element);
}

function clearFormErrorHighlights(elem, className) {
  const formElem = elem.closest('form');
  const oldErrorFields = Array.from(formElem.getElementsByClassName(className));
  oldErrorFields.forEach(elem => elem.classList.remove(className));
}

function highlightFormErrorElem(elem, className) {
  clearFormErrorHighlights(elem, className);
  elem.classList.add(className);
}

function resetElemValue(elem) {
  elem.value = '';
}

export { notifyUser, highlightFormErrorElem, resetElemValue };
