/**
 * @name APISuccess
 * @description Construct an API Success Instance with response
 */
export class APISuccess<APIResponse> {
  readonly statusCode: number;
  readonly status: string;
  readonly response: APIResponse;
  readonly time: number;

  readonly headers: Headers;
  readonly url: string;
  readonly redirected: boolean;
  readonly type: Response['type'];

  constructor({
    response,
    time,
    fetchResponse
  }: {
    response: APIResponse;
    time: number;
    fetchResponse: Response;
  }) {
    this.statusCode = fetchResponse.status;
    this.status = fetchResponse.statusText;
    this.response = response;
    this.time = time;

    this.headers = fetchResponse.headers;
    this.url = fetchResponse.url;
    this.redirected = fetchResponse.redirected ?? false;
    this.type = fetchResponse.type ?? 'default';
  }
}
