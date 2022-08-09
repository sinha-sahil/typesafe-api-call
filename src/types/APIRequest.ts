export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';


export interface JSONObject {
	[key: string]: JSONValue;
}

export type JSONValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| JSONValue[]
	| JSONObject;


/**
 * @name APIRequest
 * @description Construct API Request which is consumable by the callAPI fn
 */

export interface APIRequest {
  url: URL;
  body: JSONObject;
  method: HttpMethod;
  headers: Record<string, string>;
}
