import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundled files are copied to dist/bundled/ during build.
// Structure: mcp/dist/common/paths.js -> mcp/dist/bundled/
// This works for both local development and npm/npx installs.
const BUNDLED_ROOT = path.resolve(__dirname, '../bundled');

export const README_PATH = path.join(BUNDLED_ROOT, 'README.md');
export const EXAMPLES_PATH = path.join(BUNDLED_ROOT, 'examples', 'index.ts');
export const PACKAGE_JSON_PATH = path.join(BUNDLED_ROOT, 'package.json');
