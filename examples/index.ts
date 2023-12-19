import { decodeArray } from 'type-decoder';
// Replace ../dist with typesafe-api-call in your project
import { APICaller, APIResponse, type APIRequest, APISuccess } from '../dist';
import { CreatePostResponse, decodeCreatePostResponse, decodePost, type Post } from './generated';

/**
 * @description We will use https://jsonplaceholder.typicode.com/ as an mock API to test & demonstrate how to use this package
 */

const serverEndpoint = 'https://jsonplaceholder.typicode.com';

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

console.log('------- GET Example Response -------');
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

console.log('------- POST Example Response -------');

if (createPostResult instanceof APISuccess) {
  console.log('New post: ', createPostResult.response);
} else {
  console.log('Failure in creating new post ', createPostResult.errorDetails);
}

// #endregion
