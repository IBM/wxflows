import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import wxflows from "@wxflows/sdk";

const debug = (message: string, data?: any) => {
  // use console.error() instead of console.log() since Claude.ai desktop captures stderr more reliably.
  console.error(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};
async function main() {

  debug('Starting Wxflows MCP server');

  const server = new Server({
    name: "wxflows-server",
    version: "1.0.0",
  }, {
    capabilities: {
      tools: {}
    }
  });

  const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT || "",
    apikey: process.env.WXFLOWS_APIKEY || "", // wxflows whoami --apikey
  });

  debug('Wxflows MCP Server initialized');

  // Define available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    debug('ListToolsRequestSchema request');
    const tools = await toolClient.tools;
    let mcpTools = [];
    if (tools.length > 0) {
      const mcpTools = tools.map(
        ({ function: { name, description, parameters } }) => ({
          name,
          description: `${description}. Use the provided GraphQL schema: ${JSON.stringify(
            parameters
          )}. Don't use a field subselection on the query when the response type is JSON, don't encode any of the input parameters and use single quotes whenever possible when constructing the GraphQL query.`,
          inputSchema: parameters,
        })
      );
      debug('ListToolsRequestSchema response', mcpTools);
      return { tools: mcpTools };
    }
    debug('ListToolsRequestSchema response; tools = []');
    return { tools: [] };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    debug('CallToolRequestSchema request', request.params);
    if (request.params.name) {
      const toolName = request.params.name;
      const toolArguments = request.params.arguments as {
        [key: string]: unknown;
        query?: string | undefined;
      };

      try {
        const toolResult = await toolClient.execTool(toolName, toolArguments);
        debug('CallToolRequestSchema result', toolResult);
        return {
          toolResult,
        };
      } catch (error) {
        debug('CallToolRequestSchema error', error);
        throw new McpError(
          ErrorCode.InternalError,
          `wxflows error: ${error instanceof Error ? error.message : "something went wrong"
          }`
        );
      }
    }
    throw new Error("Tool not found");
  });

  const transport = new StdioServerTransport();
  try {
      debug('Wxflows MCP Server; Connecting transport');
      await server.connect(transport);
  } catch (error) {
      debug('Wxflows MCP Server; Transport connection error', error);
      throw error;
  }
}

main().catch(error => {
  debug('Fatal error', error);
  process.exit(1);
});