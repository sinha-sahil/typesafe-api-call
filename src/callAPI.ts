import type { APIRequest, APIResponse, JSONObject } from './types';
import { APISuccess, APIFailure } from './types';

type ResponseDecoder<ExpectedResponse> = (rawResponse: JSONObject) => ExpectedResponse | null;

/**
 * @name callAPI
 * @description A global function for making API Calls, Uses fetch and constructs request from apiRequest param passed
 * @param apiRequest An instance/object which implements APIRequest interface used to call API
 * @param responseDecoder An function which helps decoding raw response to expected type
 * @returns An resolved Promise with Two Instances - APISuccess or APIFailure
 */

export async function callAPI<ExpectedResponse>(
  apiRequest: APIRequest,
  responseDecoder: ResponseDecoder<ExpectedResponse>
): Promise<APIResponse<ExpectedResponse>> {
  try {
    const options: RequestInit = {
      method: apiRequest.method.toUpperCase(),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: apiRequest.headers,
      redirect: 'manual',
      referrerPolicy: 'no-referrer',
      body: apiRequest.method === 'GET' ? null : JSON.stringify(apiRequest.body)
    };

    const apiResponse: Response = await fetch(apiRequest.url.href, options);
    const responseJson = await apiResponse.json();

    /**
     * @description Considering only 200 and 201 as successful API response
     * @todo Extend status codes in case server returns different types of status codes
     */
    if (apiResponse.status === 200 || apiResponse.status === 201) {
      // Attempting Raw Response decode
      const decodeData = responseDecoder(responseJson);
      if (decodeData) {
        // Returning successfully decoded data
        const apiSuccessResponse = new APISuccess(
          apiResponse.status,
          apiResponse.statusText,
          decodeData
        );
        return Promise.resolve(apiSuccessResponse);
      } else {
        const apiFailureResult = createAPIFailure(apiResponse.statusText, apiResponse.status, responseJson);
        return Promise.resolve(apiFailureResult);
      }
    } else if (apiResponse.status === 400 || apiResponse.status === 500) {
      const apiFailureResult = createAPIFailure(apiResponse.statusText, apiResponse.status, responseJson);
      return Promise.resolve(apiFailureResult);
    } else {
      // Returning Error in cases of status code apart from 200, 201, 400
      const apiError = new APIFailure(apiResponse.statusText, apiResponse.status, responseJson);
      return Promise.resolve(apiError);
    }
  } catch (e) {
    // Returning Error in cases where API caller function callAPI failed
    const callerError = new APIFailure('Exception in call API: ' + e, -1, '');
    return Promise.resolve(callerError);
  }
}

/**
 * @todo Add better error response decoding
 * @param errorResponseJSON
 * @param status
 * @returns APIFailure Object
 */
function createAPIFailure(statusText: string, status: number, response: any): APIFailure {
  return new APIFailure(statusText, status, response);
}
