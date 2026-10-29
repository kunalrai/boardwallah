import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createApp } from "./app";
import { createMcpServer } from "./mcp";

const { services } = createApp();
const server = createMcpServer(services);
await server.connect(new StdioServerTransport());
