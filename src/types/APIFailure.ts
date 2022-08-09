/**
 * @name APIFailure
 * @description Construct an API Error Instance.
 * @constructor Takes ErrorMessage String and Error Code Number
 */
 export class APIFailure {
  readonly errorMessage: string;
  readonly errorCode: number;
  errorResponse: any;

  constructor(errorMessage: string, errorCode: number, errorResponse: any) {
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
    this.errorResponse = errorResponse;
  }
}
