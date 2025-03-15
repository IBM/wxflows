# Using watsonx.ai to build a Text-to-SQL Agent

Here's a step-by-step tutorial for setting up and deploying an AI Agent with `watsonx.ai` and LangGraph, including installing necessary tools, deploying the app, and running it locally.

This example consists of the following pieces:

- watsonx.ai or ollama (models)
- LangGraph (agent)
- Next.js (user inteface)
- sqlite3 (in-memory database)

> You can use any of the [supported chat models](https://js.langchain.com/docs/integrations/chat/).

This guide will walk you through installing the dependencies, initializing and deploying a project, and running the application locally. We’ll use `sqlite3` to run a local in-memory database.

## Before you start

Clone this repository and open the right directory:

```bash
git clone https://github.com/IBM/wxflows.git
cd examples/text-to-sql-agent
```

## Step 1: Install Dependencies in the Application

To run the application you need to install the necessary dependencies:

```bash
npm i
```

This command installs all required packages, including LangGraph and any dependencies specified in the project.

## Step 2: Set Up Environment Variables

Copy the sample environment file to create your `.env` file:

```bash
cp .env.sample .env
```

Edit the `.env` file and add your credentials, such as API keys and other required environment variables. Ensure the credentials are correct to allow the tools to authenticate and interact with external services.

## Step 3: Run the Application

Finally, start the application by running:

```bash
npm run dev
```

This command initiates your application, allowing you to asking questions like:

- How many order are there?
- Return all orders
- Which customers placed the most orders

Have a look at the datavase schema in `/src/app/database.ts` to learn more about the data structure.

## Summary

You’ve now successfully set up, deployed, and run an agentic application. This setup provides a flexible environment to leverage external tools for data retrieval, allowing you to further build and expand your app with `wxflows`. See the instructions in [tools](../../tools/README.md) to add more tools or create your own tools from Databases, NoSQL, REST or GraphQL APIs.
