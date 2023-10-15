export async function generateRawResponse(apiResponse: Response): Promise<unknown> {
  let result = null;
  const contentType = apiResponse.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    result = await apiResponse.json();
  } else {
    result = await apiResponse.text();
  }
  return result;
}
