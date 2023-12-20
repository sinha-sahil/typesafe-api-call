import { decodeArray } from 'type-decoder';
// Replace ../dist with typesafe-api-call in your project
import { APICaller, APIResponse, type APIRequest, APISuccess } from '../src';
import { CreatePostResponse, decodeCreatePostResponse, decodePost, type Post } from './generated';

/**
 * @description We will use https://jsonplaceholder.typicode.com/ as an mock API to test & demonstrate how to use this package
 */

const serverEndpoint = 'https://jsonplaceholder.typicode.com';

// #region Example of registering hooks

APICaller.registerStartHook({
  id: 'sampleID',
  func: (apiRequest: APIRequest) => {
    console.log('\n➡ API Request started: ', apiRequest.method, apiRequest.url.href);
  }
});

APICaller.registerEndHook({
  id: 'sampleEndId',
  func: (apiRequest: APIRequest, response: APIResponse<unknown, unknown>) => {
    let responseTime;
    let responseCode;
    if (response instanceof APISuccess) {
      responseTime = response.time;
      responseCode = response.status;
    } else {
      responseTime = response.time;
      responseCode = response.errorCode;
    }
    console.log(
      '➡ API Request ended: ',
      apiRequest.method,
      apiRequest.url.href,
      ' completed in:',
      responseTime + 'ms',
      'with response: ',
      responseCode
    );
  }
});

APICaller.registerRetryHook({
  id: 'sampleRetryId',
  func: (apiRequest: APIRequest, response: APIResponse<unknown, unknown>, retryCount) => {
    console.log(
      '➡ API Retry Response: ',
      apiRequest.method,
      apiRequest.url.href,
      response instanceof APISuccess
        ? response.status
        : response.errorDetails?.class ?? response.errorCode,
      ' on attempt: ',
      retryCount
    );
  }
});

// #endregion

// #region Example 1: GET request

async function getAllPosts(): Promise<APIResponse<Post[], unknown>> {
  const apiRequest: APIRequest = {
    url: new URL(`${serverEndpoint}/posts`),
    method: 'GET'
  };
  const apiResponse = await APICaller.call(apiRequest, (successResponse: unknown) => {
    return decodeArray(successResponse, decodePost);
  });
  return apiResponse;
}

const getAllPostResult = await getAllPosts();

console.log('\n------- GET Example Response -------\n');
/**
 * @description
 *    Simply check if the response is an instance of APISuccess or APIFailure
 *    If it is an instance of APISuccess, then we can safely access the response property
 */
if (getAllPostResult instanceof APISuccess) {
  // The type of allPosts.response is ensured to be Post[]; Printing only first 2 posts
  console.log('All posts: ', getAllPostResult.response.slice(0, 2));
} else {
  // Access the errorResponse property of APIFailure to get the error details
  console.log('Failure in fetching all posts ', getAllPostResult.errorDetails);
}

// #endregion

// #region Example 2: POST request

async function createPost(post: Post): Promise<APIResponse<CreatePostResponse, unknown>> {
  const apiRequest: APIRequest = {
    url: new URL(`${serverEndpoint}/posts`),
    method: 'POST',
    body: JSON.stringify(post)
  };
  const apiResponse = await APICaller.call(apiRequest, (successResponse: unknown) => {
    return decodeCreatePostResponse(successResponse);
  });
  return apiResponse;
}

const newPost: Post = {
  userId: 1,
  id: 1,
  title: 'New post',
  body: 'New post body'
};

const createPostResult = await createPost(newPost);

console.log('\n------- POST Example Response -------\n');

if (createPostResult instanceof APISuccess) {
  console.log('New post: ', createPostResult.response);
} else {
  console.log('Failure in creating new post ', createPostResult.errorDetails);
}

// #endregion

// #region Example 3: GET request with retries

console.log('\n------- Call with Retries: GET Example Response -------\n');

async function getAllPostsWithRetry(): Promise<Post | null> {
  const apiRequest: APIRequest = {
    url: new URL(`${serverEndpoint}/posts`),
    method: 'GET'
  };
  const apiResponse = await APICaller.callWithRetries(
    apiRequest,
    (successResponse: unknown) => {
      return decodeArray(successResponse, decodePost);
    },
    {
      maxRetries: 4,
      retryInterval: 3000,
      retryOn: [
        'DOMException',
        'DecodeFailure',
        'Error',
        'InternalError',
        'TypeError',
        'UnhandledException'
      ]
    }
  );
  if (apiResponse instanceof APISuccess) {
    return apiResponse.response[0];
  }
  return null;
}

await getAllPostsWithRetry();

// #endregion
