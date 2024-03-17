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

export { notifyUser };
