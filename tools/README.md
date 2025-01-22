# Tools

This is an overview of tools that can be used in watsonx.ai Flows Using using the `wxflows` CLI. More tools will be added over time, you can also create a tool for your own data source (Databases; REST, SOAP & GraphQL APIs).

## Available pre-built tools

| Tool                                                      | Description                                                                         | File                                                                                       | Auth                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [exchange](/tools/exchange/README.md)                     | Convert currencies from one currency to another, both current and historic rates    | https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/exchange.zip           | No API Key required                                                   |
| [wikipedia](/tools/wikipedia/README.md)                   | Find information on just about anything on Wikipedia                                | https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/wikipedia.zip          | No API Key required                                                   |
| [google_books](/tools/google_books/README.md)             | Retrieve information from millions of books                                         | https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/google_books.zip       | No API Key required                                                   |
| [youtube_transcript](/tools/youtube_transcript/README.md) | Retrieve transcripts for videos on YouTube                                          | https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/youtube_transcript.zip | No API Key required                                                   |
| [math](/tools/math/README.md)                             | Performs mathematical calculations, date and unit conversions, formula solving, etc | https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/math.zip               | No API Key required                                                   |
| [weather](/tools/weather/README.md)                       | Get the current weather for a location                                              | https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/weather.zip            | API Key needed, see [here](/tools/weather/README.md) for instructions |

The tools in this directory can be added to your `wxflows` project using the `.ZIP` files in this directory. For example, to use the "Wikipedia" tool in your project run the following command:

- **Node.js CLI (experimental)**

  ```bash
  wxflows import tool https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/wikipedia.zip
  ```

- **Python CLI**

  ```bash
  wxflows init --endpoint-name api/my-project \
    --import-name wikipedia \
    --import-package https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/wikipedia.zip \
    --import-tool-name wikipedia \
    --import-tool-description "Retrieve information from Wikipedia." \
    --import-tool-fields "search|page"
  ```

See [create your own tool](#create-your-own-tool) for converting any data source into a tool.

## Editing a tool

You can edit the tool description after importing:

<details open>
  <summary><strong>Python CLI</strong></summary>

You can edit the tool definition that was generated in the `wxflows.toml` file, or register a new tool by creating the tool definition for a new tool in the `wxflows.toml` file manually:

```python
# wxflows.toml
# ...

[[wxflows.deployment.endpoint.imports]]
name = "my_tool"
directory = "path/to/graphql"

[[wxflows.deployment.endpoint.imports.tools]]
name = "my_tool"
description = """The description for my custom tool"""
fields = "fieldA|fieldB"
```

After editing the `wxflows.toml` file, run `wxflows deploy` to make your tools available. See [here](https://wxflows.ibm.stepzen.com/docs/python-cli/register-tools) for more instruction on registering tools using the Python CLI.

</details>

<details>
  <summary><strong>Node.js CLI (experimental)</strong></summary>

When you generate a GraphQL schema for your data source, a placeholder tool definition will be added to the `tools.graphql` file in your project. Open the file and uncomment the generated tool definition, or create your own tool definition from scratch. For example:

```graphql
extend type Query {
  my_tool: TC_GraphQL
    @supplies(query: "tc_tools")
    @materializer(
      query: "tc_graphql_tool"
      arguments: [
        { name: "name", const: "my_tool" }
        { name: "description", const: "The description for my custom tool" }
        { name: "fields", const: "fieldA|fieldB" }
      ]
    )
}
```

After editing the `tools.graphql` file, run `wxflows deploy` to make your tools available. See [here](https://wxflows.ibm.stepzen.com/docs/node-cli/register-tools) for more instruction on registering tools using the Node.js CLI.

</details>

## Create your own tool

Next to using prebuilt tools you can also build your own tool from an existing data source:

- [Python CLI](https://wxflows.ibm.stepzen.com/docs/python-cli/import-tools)
- [Node.js CLI (experimental)](https://wxflows.ibm.stepzen.com/docs/node-cli/import-tools)

## Share your tool

If you want to share your tool with others, you need to create a `.ZIP` file out of your `.graphql` files. On Macs can do this by running the command:

```
zip -r mydir.zip mydir
```

You can share the created `.zip` file with others or contribute to this repository.

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!
