# Typesafe API Call MCP Server

This is a **Model Context Protocol (MCP)** server for the `typesafe-api-call` library. It provides a robust integration for LLMs to understand and generate code using the library.

## Architecture

The server is built with a modular architecture using the official `@modelcontextprotocol/sdk`:

- **Resources**: Read-only access to docs, examples, and type definitions.
- **Tools**: Active search and retrieval capabilities.
- **Prompts**: Templates for code generation and error explanation.

## Features

### Resources (Data)

| URI                                     | Description                                         | MIME Type          |
| --------------------------------------- | --------------------------------------------------- | ------------------ |
| `typesafe-api-call://docs/readme`       | Complete README.md documentation                    | `text/markdown`    |
| `typesafe-api-call://examples/main`     | Full usage examples source code                     | `text/typescript`  |
| `typesafe-api-call://meta/package_json` | Package version and dependencies                    | `application/json` |
| `typesafe-api-call://types/definitions` | Aggregated core type definitions (APIRequest, etc.) | `text/typescript`  |

### Tools (Actions)

| Name                   | Description                                            | Arguments         |
| ---------------------- | ------------------------------------------------------ | ----------------- |
| `list_doc_sections`    | List all available section titles in the documentation | _(none)_          |
| `get_doc_section`      | Retrieve a specific documentation section              | `section`: string |
| `search_documentation` | Fuzzy search the docs for keywords                     | `query`: string   |

### Prompts (Templates)

| Name                | Description                    | Arguments                                  |
| ------------------- | ------------------------------ | ------------------------------------------ |
| `generate_api_call` | Scaffold an API call function  | `url`, `method`, `responseType`, `hasBody` |
| `create_decoder`    | Scaffold a response decoder    | `typeName`, `properties`                   |
| `explain_error`     | Explain a specific error class | `errorClass`                               |

## Installation

### Via npx (Recommended)

The easiest way to use this MCP server - no installation required:

```bash
npx typesafe-api-call-mcp
```

### Via npm Global Install

Install globally to use anywhere:

```bash
npm install -g typesafe-api-call-mcp
typesafe-api-call-mcp
```

### For Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/sinha-sahil/typesafe-api-call.git
   ```
2. Navigate to the MCP directory:
   ```bash
   cd typesafe-api-call/mcp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the server:
   ```bash
   npm run build
   ```

## Usage with Claude for Desktop

Add one of the following configurations to your `claude_desktop_config.json`:

### Using npx (Recommended)

```json
{
  "mcpServers": {
    "typesafe-api-call": {
      "command": "npx",
      "args": ["typesafe-api-call-mcp"]
    }
  }
}
```

### Using Global Install

```json
{
  "mcpServers": {
    "typesafe-api-call": {
      "command": "typesafe-api-call-mcp"
    }
  }
}
```

### Using Local Build

```json
{
  "mcpServers": {
    "typesafe-api-call": {
      "command": "node",
      "args": ["/absolute/path/to/typesafe-api-call/mcp/dist/index.js"]
    }
  }
}
```

## License

ISC
