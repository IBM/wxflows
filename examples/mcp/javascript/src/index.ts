import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import wxflows from "@wxflows/sdk";

const server = new Server(
  {
    name: "wxflows-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || "",
  apikey: process.env.WXFLOWS_APIKEY || "", // wxflows whoami --apikey
});

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = await toolClient.tools;

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

    return { tools: mcpTools };
  }

  return { tools: [] };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name) {
    const { query }: any = request.params.arguments;

    try {
      const toolResult = await toolClient.execGraphQL(query);

      return {
        toolResult,
      };
    } catch (e) {
      throw new McpError(
        ErrorCode.InternalError,
        `wxflows error: ${
          e instanceof Error ? e.message : "something went wrong"
        }`
      );
    }
  }
  throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
