import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'fs/promises';
import { README_PATH } from '../common/paths.js';

export function registerTools(server: McpServer) {
  // 1. List Documentation Sections
  server.registerTool(
    'list_doc_sections',
    {
      description: 'List all available section titles in the documentation.',
      inputSchema: z.object({})
    },
    async () => {
      try {
        const content = await fs.readFile(README_PATH, 'utf-8');
        // Match lines starting with "## " (H2 headers)
        const matches = content.match(/^## (.*?)$/gm);

        if (!matches || matches.length === 0) {
          return {
            content: [{ type: 'text', text: 'No sections found.' }]
          };
        }

        // Remove the "## " prefix
        const sections = matches.map((s) => s.replace(/^##\s+/, '').trim());

        return {
          content: [
            {
              type: 'text',
              text: `Available Documentation Sections:\n- ${sections.join('\n- ')}`
            }
          ]
        };
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Failed to list sections: ${error}`);
      }
    }
  );

  // 2. Get Documentation Section
  server.registerTool(
    'get_doc_section',
    {
      description: 'Get a specific section of the documentation.',
      inputSchema: z.object({
        section: z
          .string()
          .describe(
            'The title of the section to retrieve (e.g. "Installation", "Examples"). Case insensitive.'
          )
      })
    },
    async ({ section }) => {
      try {
        const content = await fs.readFile(README_PATH, 'utf-8');

        const safeSection = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`## ${safeSection}[\\s\\S]*?(?=\\n## |$)`, 'i');
        const match = content.match(regex);

        if (!match) {
          // Provide a helpful error message with available sections if possible
          const matches = content.match(/^## (.*?)$/gm);
          const available = matches
            ? matches.map((s) => s.replace(/^##\s+/, '').trim()).join(', ')
            : 'None';

          throw new McpError(
            ErrorCode.InvalidParams,
            `Section '${section}' not found. Available sections: ${available}`
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: match[0].trim()
            }
          ]
        };
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(ErrorCode.InternalError, `Error reading documentation: ${error}`);
      }
    }
  );

  // 2. Search Documentation
  server.registerTool(
    'search_documentation',
    {
      description: 'Search for specific keywords or phrases in the documentation.',
      inputSchema: z.object({
        query: z.string().describe('The search query (case-insensitive)')
      })
    },
    async ({ query }) => {
      try {
        const content = await fs.readFile(README_PATH, 'utf-8');

        const lines = content.split('\n');
        const matches = lines
          .map((line, index) => ({ line, index: index + 1 }))
          .filter(({ line }) => line.toLowerCase().includes(query.toLowerCase()));

        if (matches.length === 0) {
          return {
            content: [{ type: 'text', text: `No matches found for query: "${query}"` }]
          };
        }

        // Improved context formatting
        // Returns the match + limited context if needed, but for now simple line listing is good
        // to avoid token limits with large results.
        const resultText = matches
          .map((m) => `Line ${m.index}: ${m.line.trim()}`)
          .slice(0, 50) // Limit to top 50 matches to prevent overflow
          .join('\n');

        const suffix = matches.length > 50 ? `\n...and ${matches.length - 50} more matches.` : '';

        return {
          content: [{ type: 'text', text: resultText + suffix }]
        };
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Search failed: ${error}`);
      }
    }
  );
}
