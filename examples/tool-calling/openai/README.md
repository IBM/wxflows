# Using watsonx.ai Flows Engine

Here's a step-by-step tutorial for setting up and deploying a project with `wxflows`, including installing necessary tools, deploying the app, and running it locally.

This guide will walk you through installing the `wxflows` CLI, initializing and deploying a project, and running the application locally. We’ll use `google_books` and `wikipedia` tools as examples for tool calling with `wxflows`.

## Step 1: Install wxflows CLI

Begin by installing the `wxflows` CLI tool. You can find installation instructions on the [wxflows installation page](https://wxflows.ibm.stepzen.com/docs/installation):

  - Download the CLI from https://wxflows.ibm.stepzen.com/docs/installation
  - Create a new directory on your machine
  - Run the following command in this directory:

    ```bash
    pip install wxflows_cli-1.0.0rc189-py3-none-any.whl --force-reinstall
    ```

    This will install the latest version of the CLI from the downloaded `.whl` file.

  - After installing, make sure to [login to the CLI](https://wxflows.ibm.stepzen.com/docs/authentication).

## Step 2: Initialize the wxflows Project

Next, initialize a `wxflows` project. This setup imports two tools: `google_books` for retrieving information from Google Books, and `wikipedia` for Wikipedia queries.

Run the following command to initialize the project with these tools:

```bash
wxflows init --endpoint-name api/wxflows-toolcalling \
--import-name google_books --import-package https://github.com/IBM/wxflows/raw/refs/heads/main/tools/google_books.zip \
--import-tool-name google_books --import-tool-description "Retrieve information from Google Books. Find books by search string, for example to search for Daniel Keyes 'Flowers for Algernon' use q: 'intitle:flowers+inauthor:keyes'" --import-tool-fields "books|book" \
--import-name wikipedia --import-package https://github.com/IBM/wxflows/raw/refs/heads/main/tools/wikipedia.zip \
--import-tool-name wikipedia --import-tool-description "Retrieve information from Wikipedia." --import-tool-fields "search|page"
```

This command does the following:

- **Defines an endpoint** `api/wxflows-toolcalling` for the project.
- **Imports `google_books` tool** with a description for searching books and specifying fields `books|book`.
- **Imports `wikipedia` tool** with a description for Wikipedia searches and specifying fields `search|page`.

## Step 3: Deploy the wxflows Project

Now, deploy the `wxflows` project by running:

```bash
wxflows deploy
```

This command deploys the endpoint and tools defined during initialization, making them ready for use within your application.

## Step 4: Install Dependencies in the Application

From the project’s root directory install the necessary dependencies:

```bash
npm i
```

This command installs all required packages, including the `wxflows` SDK and any dependencies specified in the project.

## Step 5: Set Up Environment Variables

Copy the sample environment file to create your `.env` file:

```bash
cp .env.sample .env
```

Edit the `.env` file and add your credentials, such as API keys and other required environment variables. Ensure the credentials are correct to allow the tools to authenticate and interact with external services.

## Step 6: Run the Application

Finally, start the application by running:

```bash
node index.js
```

This command initiates your application, allowing you to call and test the `google_books` and `wikipedia` tools through `wxflows`.

## Summary

You’ve now successfully set up, deployed, and run a `wxflows` project with `google_books` and `wikipedia` tools. This setup provides a flexible environment to leverage external tools for data retrieval, allowing you to further build and expand your app with `wxflows`. See the instructions in [tools](../../../tools/README.md) to add more tools or create your own tools from Databases, NoSQL, REST or GraphQL APIs.