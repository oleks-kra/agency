import { notifyUser } from './notifications';

// handles deletion of a resource (e.g. article / category)
async function deleteResource(resourceType, resourceId, returnUrl) {
  console.log('deleteResource() invoked');
  // determine endpoint and method
  let apiEndpoint;
  switch (resourceType) {
    case 'article':
      apiEndpoint = `http://localhost:3000/api/v1/articles/${resourceId}`;
      break;
    case 'category':
      apiEndpoint = `http://localhost:3000/api/v1/categories/${resourceId}`;
      break;
    default:
      console.log(`Error: invalid resource type passed to deleteResource.`);
  }
  // HAS TO BE in all uppercase; otherwise won't work
  const method = 'DELETE';
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  try {
    // send request
    const response = await fetch(apiEndpoint, {
      method: method,
      headers
    });

    // read response body as JSON
    const responseBody = await response.json();
    if (responseBody.status === 'success') {
      notifyUser('success', 'Resource removed successfully.');
      window.setTimeout(() => {
        window.location.assign(returnUrl);
      }, 5000);
    } else {
      console.log('responseBody.status:', responseBody.status);
      notifyUser('error', responseBody.message || 'Failed to remove resource.');
    }
  } catch (error) {
    console.log('caught error:', error);
    notifyUser('error', error.message || 'Error while removing resource.');
  }
}

export default deleteResource;
