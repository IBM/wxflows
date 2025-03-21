# Using watsonx.ai Flows Engine with Model Context Protocol (MCP)

Here's a step-by-step tutorial for setting up and deploying a project with `wxflows`, including installing necessary tools, deploying the app, and running it locally.

This example consists of the following pieces:

- MCP TypeScript SDK (mcp server)
- wxflows SDK (tools)

> You can use any of the [supported MCP clients](https://modelcontextprotocol.io/clients).

This guide will walk you through installing the `wxflows` CLI, initializing and deploying a project, and running the application locally. We’ll use `google_books` and `wikipedia` tools as examples for tool calling with `wxflows`.

## Before you start

Clone this repository and open the right directory:

```bash
git clone https://github.com/IBM/wxflows.git
cd examples/mcp/javascript
```

## Step 1: Set up wxflows

Before you can start building AI applications using watsonx.ai Flows Engine:

1. [Sign up](https://ibm.biz/wxflows) for a free account
2. [Download & install](https://wxflows.ibm.stepzen.com/docs/installation) the Node.js CLI
3. [Authenticate](https://wxflows.ibm.stepzen.com/docs/authentication) your account

## Step 2: Deploy a Flows Engine project

Move into the `wxflows` directory:

```bash
cd wxflows
```

There's already a wxflows project for you set up this repository with the following values:

- **Defines an endpoint** `api/mcp-example` for the project.
- **Imports `google_books` tool** with a description for searching books and specifying fields `books|book`.
- **Imports `wikipedia` tool** with a description for Wikipedia searches and specifying fields `search|page`.

You can deploy this tool configuration to a Flows Engine endpoint by running:

```bash
wxflows deploy
```

This command deploys the endpoint and tools defined, these will be used by the `wxflows` SDK in your application.

## Step 3: Set Up Environment Variables

From the project’s root directory copy the sample environment file to create your `.env` file:

```bash
cp .env.sample .env
```

Edit the `.env` file and add your credentials, such as API keys and other required environment variables. Ensure the credentials are correct to allow the tools to authenticate and interact with external services.

## Step 4: Install Dependencies in the Application

To run the application you need to install the necessary dependencies:

```bash
npm i
```

This command installs all required packages, including the `@wxflows/sdk` package and any dependencies specified in the project.

## Step 5: Build the MCP server

Build the server by running:

```bash
npm run build
```

## Step 6: Use in a MCP client

Finally, you can use the MCP server in a client. To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "wxflows-server": {
      "command": "node",
      "args": ["/path/to/wxflows-server/build/index.js"],
      "env": {
        "WXFLOWS_APIKEY": "YOUR_WXFLOWS_APIKEY",
        "WXFLOWS_ENDPOINT": "YOUR_WXFLOWS_ENDPOINT"
      }
    }
  }
}
```

You can now open Claude Desktop and should be seeing the tools from the `wxflows-server` listed. You can now test the `google_books` and `wikipedia` tools through Claude Desktop.

## Summary

You’ve now successfully set up, deployed, and run a `wxflows` project with `google_books` and `wikipedia` tools. This setup provides a flexible environment to leverage external tools for data retrieval, allowing you to further build and expand your app with `wxflows`. See the instructions in [tools](../../../../tools/README.md) to add more tools or create your own tools from Databases, NoSQL, REST or GraphQL APIs.

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "weather-server": {
      "command": "/path/to/weather-server/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
