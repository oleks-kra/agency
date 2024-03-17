import { notifyUser } from './notifications';

async function callApiAndRedirect(
  formData,
  apiEndpoint,
  httpMethod,
  returnUrl
) {
  try {
    // send request
    const response = await fetch(apiEndpoint, {
      method: httpMethod,
      body: formData
    });

    // read response body as JSON
    const responseBody = await response.json();
    if (responseBody.status === 'success') {
      notifyUser('success', 'Resource saved successfully.');
      window.setTimeout(() => {
        window.location.assign(returnUrl);
      }, 5000);
    } else {
      notifyUser('error', responseBody.message || 'Failed to save resource.');
    }
  } catch (error) {
    console.log('caught error:', error);
    notifyUser('error', error.message || 'Error while saving resource.');
  }
}

/* async function callApiAndRedirect(formData, action, id) {
  // determine endpoint and method
  let apiEndpoint;
  let method;
  if (action === 'create') {
    apiEndpoint = 'http://localhost:3000/api/v1/articles/';
    method = 'post';
  } else {
    apiEndpoint = `http://localhost:3000/api/v1/articles/${id}`;
    // has to be in all uppercase; otherwise won't work
    method = 'PATCH';
  }

  try {
    // send request
    const response = await fetch(apiEndpoint, {
      method: method,
      body: formData
    });

    // read response body as JSON
    const responseBody = await response.json();
    if (responseBody.status === 'success') {
      notifyUser('success', 'Article saved successfully.');
      window.setTimeout(() => {
        window.location.assign(
          'http://localhost:3000/admin/blog/articles/form'
        );
      }, 5000);
    } else {
      notifyUser('error', responseBody.message || 'Failed to save article.');
    }
  } catch (error) {
    console.log('caught error:', error);
    notifyUser('error', error.message || 'Error while saving article.');
  }
} */

export default callApiAndRedirect;
