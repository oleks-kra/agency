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
      window.location.assign(returnUrl);
    } else {
      // asynchronously initiate server-side cleanup process
      // 1. Remove images from the temp folder

      // let user know about the error
      notifyUser('error', responseBody.message || 'Failed to save resource.');
    }
  } catch (error) {
    console.log('caught error:', error);
    notifyUser('error', error.message || 'Error while saving resource.');
  }
}

export default callApiAndRedirect;
