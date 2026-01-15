import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer) {
  // 1. Generate API Call Code
  server.registerPrompt(
    'generate_api_call',
    {
      description: 'Generate a boilerplate API call function using typesafe-api-call',
      argsSchema: {
        url: z.string().describe('The API endpoint URL'),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).describe('HTTP Method'),
        responseType: z
          .string()
          .describe('The TypeScript type for successful response')
          .default('unknown'),
        hasBody: z
          .enum(['true', 'false'])
          .describe('Whether the request should include a body')
          .default('false')
      }
    },
    async ({ url, method, responseType, hasBody }) => {
      const bodySection =
        hasBody === 'true'
          ? `\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(data)`
          : '';

      const functionName = `call${method.charAt(0) + method.slice(1).toLowerCase()}Api`;

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Generate a TypeScript function named "${functionName}" using typesafe-api-call.
Details:
- URL: ${url}
- Method: ${method}
- Expected Response Type: ${responseType}
${hasBody === 'true' ? '- The function should accept a "data" argument for the request body.' : ''}

Code structure:
1. Define the APIRequest.${bodySection ? ' Include headers and body.' : ''}
2. Call APICaller.call() with a response decoder.
3. Handle APISuccess (return data) and APIFailure (log/throw).`
            }
          }
        ]
      };
    }
  );

  // 2. Create Response Decoder
  server.registerPrompt(
    'create_decoder',
    {
      description: 'Generate a response decoder function for a specific type',
      argsSchema: {
        typeName: z.string().describe('The name of the type to decode'),
        properties: z
          .string()
          .describe('Comma-separated list of properties (e.g. "id:number, name:string")')
      }
    },
    async ({ typeName, properties }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Create a safe response decoder function for a type named "${typeName}" using the typesafe-api-call pattern.
Properties to validate: ${properties}

The decoder should:
1. Accept 'unknown' as input.
2. Validate that the input is an object and not null.
3. Validate that each property exists and has the correct type.
4. Return the typed object or null.
5. Use type predicates if possible.`
            }
          }
        ]
      };
    }
  );

  // 3. Explain Error
  server.registerPrompt(
    'explain_error',
    {
      description: 'Explain the meaning of a specific APIFailure error class',
      argsSchema: {
        errorClass: z
          .enum([
            'DOMException',
            'TypeError',
            'DecodeFailure',
            'InternalError',
            'Error',
            'UnhandledException'
          ])
          .describe('The error class from APIFailure.errorDetails.class')
      }
    },
    async ({ errorClass }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Explain what the error class "${errorClass}" means in the context of the typesafe-api-call library.
What are the common causes for this error?
How should I handle it in my code?`
            }
          }
        ]
      };
    }
  );
}
