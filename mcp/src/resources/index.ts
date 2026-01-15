import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import { README_PATH, EXAMPLES_PATH, PACKAGE_JSON_PATH } from '../common/paths.js';

export function registerResources(server: McpServer) {
  // 1. README Resource
  server.registerResource(
    'readme',
    'typesafe-api-call://docs/readme',
    {
      description: 'The main README.md documentation file for the library',
      mimeType: 'text/markdown'
    },
    async (uri) => {
      try {
        const content = await fs.readFile(README_PATH, 'utf-8');
        return {
          contents: [
            {
              uri: uri.href,
              text: content,
              mimeType: 'text/markdown'
            }
          ]
        };
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Failed to read README: ${error}`);
      }
    }
  );

  // 2. Examples Resource
  server.registerResource(
    'examples',
    'typesafe-api-call://examples/main',
    {
      description: 'The main examples file (examples/index.ts) showing usage patterns',
      mimeType: 'text/typescript'
    },
    async (uri) => {
      try {
        const content = await fs.readFile(EXAMPLES_PATH, 'utf-8');
        return {
          contents: [
            {
              uri: uri.href,
              text: content,
              mimeType: 'text/typescript'
            }
          ]
        };
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Failed to read examples: ${error}`);
      }
    }
  );

  // 3. Package Info Resource
  server.registerResource(
    'package_json',
    'typesafe-api-call://meta/package_json',
    {
      description: 'The package.json file containing version and dependency info',
      mimeType: 'application/json'
    },
    async (uri) => {
      try {
        const content = await fs.readFile(PACKAGE_JSON_PATH, 'utf-8');
        return {
          contents: [
            {
              uri: uri.href,
              text: content,
              mimeType: 'application/json'
            }
          ]
        };
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Failed to read package.json: ${error}`);
      }
    }
  );

  // 4. Type Definitions Resource (Virtual)
  server.registerResource(
    'type_definitions',
    'typesafe-api-call://types/definitions',
    {
      description: 'Aggregated core type definitions (APIRequest, APISuccess, APIFailure)',
      mimeType: 'text/typescript'
    },
    async (uri) => {
      // We construct this manually to give the LLM a clean view of the types without noise
      const typeDefs = `
// Core Types for typesafe-api-call

export interface APIRequest extends RequestInit {
  url: URL;
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  agent?: unknown;
}

export class APISuccess<T> {
  readonly statusCode: number;
  readonly status: string;
  readonly response: T;
  readonly time: number;
}

export class APIFailure<E> {
  readonly errorMessage: string;
  readonly errorCode: number;
  readonly response: E | null;
  readonly errorResponse: unknown;
  readonly errorDetails: ErrorDetails | null;
  readonly time: number;
}

export type ErrorDetails = {
  class: ErrorClass;
  name: string;
  message: string | null;
  cause: unknown;
  stack: string | null;
};

export type ErrorClass =
  | 'DOMException'
  | 'TypeError'
  | 'DecodeFailure'
  | 'InternalError'
  | 'Error'
  | 'UnhandledException';

export type ResponseDecoder<T> = (rawResponse: unknown) => T | null;
`;
      return {
        contents: [
          {
            uri: uri.href,
            text: typeDefs.trim(),
            mimeType: 'text/typescript'
          }
        ]
      };
    }
  );
}
