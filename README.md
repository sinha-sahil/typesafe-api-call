# Type safe API Caller

- Typesafe API Caller is a minimalistic JS library that allows you to call APIs in a more functional way (an API will be either successful or not successful).

- The API callers ensures that the API call will always return either of following result:
  - API Success
  - API Failure
- No need to worry about handling exceptions & errors. Just focus on handling the API Success and API Failure.

## Installation

```bash
npm install typesafe-api-caller
```

## Usage

- A simple example of calling a GET API and handling the response.

```typescript

import { APICaller, APIResponse, type APIRequest, APISuccess } from 'typesafe-api-call';

const serverEndpoint = 'https://jsonplaceholder.typicode.com';

async function getAllPosts(): Promise<APIResponse<Post[], unknown>> {
  const apiRequest: APIRequest = {
    url: new URL(`${serverEndpoint}/posts`),
    method: 'GET'
  };
  const apiResponse = await APICaller.call(apiRequest, (successResponse: unknown) => {
    // Handle success response decoding here
  }, (errorResponse: unknown) => {
    // Handle error response decoding here in case the response was not successfully decoded into success response
  });
  return apiResponse;
}

const getAllPostResult = await getAllPosts();

if (getAllPostResult instanceof APISuccess) {
  // Handle successful response here
} else {
  // Handle error response here
}
```

- Checkout more examples in the [examples](https://github.com/sinha-sahil/typesafe-api-call/blob/release/examples/index.ts)

## Development

- Clone the repository
- Install dependencies using `pnpm install`
- Run `pnpm run build` to build the library.
- You can use examples/index.ts to test your changes.

## Contribution

- The library is open to all your suggestions & bugfixes and I would love to see your contributions.
- To contribute, kindly fork the repository & raise changes to the release branch.

## Useful Libraries

- The following libraries goes really well when clubbed with typesafe-api-call .
  - [type-decoder](https://www.npmjs.com/package/type-decoder): A library to decode data types.
  - [type-crafter](https://www.npmjs.com/package/type-crafter): A library which generates types & decoders for any language.
- When combined together, you only need to write types in YAML and the library will generate the types & decoders for you. You can later use these types & decoders in typesafe-api-call to decode the API response.
- Checkout the [Example: Yaml](https://github.com/sinha-sahil/typesafe-api-call/blob/release/examples/types.yaml) & [Example: Generated Types](https://github.com/sinha-sahil/typesafe-api-call/blob/release/examples/generated/index.ts)
