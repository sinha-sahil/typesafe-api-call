/**
 * @name APISuccess
 * @description Construct an API Success Instance with response
 */
export class APISuccess<APIResponse> {
  readonly statusCode: number;
  readonly status: string;
  readonly response: APIResponse;
  readonly time: number;

  constructor(statusCode: number, status: string, response: APIResponse, time: number) {
    this.statusCode = statusCode;
    this.status = status;
    this.response = response;
    this.time = time;
  }
}
