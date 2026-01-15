#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerResources } from './resources/index.js';
import { registerTools } from './tools/index.js';
import { registerPrompts } from './prompts/index.js';
import fs from 'fs';
import { PACKAGE_JSON_PATH } from './common/paths.js';

async function main() {
  // Read version from package.json
  let packageVersion = '1.0.0';
  try {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    if (packageJson.version) {
      packageVersion = packageJson.version;
    }
  } catch (error) {
    console.error('Failed to read package.json version, defaulting to 1.0.0', error);
  }

  // Initialize MCP Server
  const server = new McpServer({
    name: 'typesafe-api-call-mcp',
    version: packageVersion
  });

  // Register Modules
  registerResources(server);
  registerTools(server);
  registerPrompts(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Typesafe API Call MCP Server (v${packageVersion}) running on stdio`);
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
