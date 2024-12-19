# Using watsonx.ai Flows Engine with LangGraph JS

Here's a step-by-step tutorial for setting up and deploying a project with `wxflows`, including installing necessary tools, deploying the app, and running it locally.

![diagram](../../../assets/wxflows-langgraph.png)

This example consists of the following pieces:

- LangChain JS SDK (models)
- LangGraph JS SDK (agent)
- wxflows SDK (tools)

> You can use any of the [supported chat models](https://js.langchain.com/docs/integrations/chat/).

This guide will walk you through installing the `wxflows` CLI, initializing and deploying a project, and running the application locally. We’ll use `google_books` and `wikipedia` tools as examples for tool calling with `wxflows`.

## Step 1: Install wxflows CLI

Begin by installing the `wxflows` CLI tool. You can find installation instructions on the [wxflows installation page](https://wxflows.ibm.stepzen.com/docs/installation):

- Download the CLI from https://wxflows.ibm.stepzen.com/docs/installation
- Create a new directory on your machine
- Run the following command in this directory:

  ```bash
  pip install wxflows_cli-1.0.0rc200-py3-none-any.whl --force-reinstall
  ```
  > Make sure to use the name of the `.whl` file you downloaded.

  This will install the latest version of the CLI from the downloaded `.whl` file.

- After installing, make sure to [login to the CLI](https://wxflows.ibm.stepzen.com/docs/authentication).

## Step 2: Deploy a Flows Engine project

There's already a `wxflows.toml` file in this repository that defines the following values:

- **Defines an endpoint** `api/examples-langgraph` for the project.
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

## Step 5: Set Up Environment Variables

Copy the sample environment file to create your `.env` file:

```bash
cp .env.sample .env
```

Edit the `.env` file and add your credentials, such as API keys and other required environment variables. Ensure the credentials are correct to allow the tools to authenticate and interact with external services.

## Step 6: Run the Application

Finally, start the application by running:

```bash
npm start
```

This command initiates your application, allowing you to call and test the `google_books` and `wikipedia` tools through `wxflows`.

## Summary

You’ve now successfully set up, deployed, and run a `wxflows` project with `google_books` and `wikipedia` tools. This setup provides a flexible environment to leverage external tools for data retrieval, allowing you to further build and expand your app with `wxflows`. See the instructions in [tools](../../../tools/README.md) to add more tools or create your own tools from Databases, NoSQL, REST or GraphQL APIs.

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!
