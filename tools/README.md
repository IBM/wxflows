# Tools

This is an overview of tools that can be used in watsonx.ai Flows Using using the `wxflows` CLI. More tools will be added over time, you can also create a tool for your own data source (Databases; REST, SOAP & GraphQL APIs).

## Available pre-built tools

| Tool | Description | File | Auth |
|------|-------------|------|--------|
| `exchange` | Convert currencies from one currency to another, both current and historic rates | https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/exchange.zip | No API Key required |
| `wikipedia` | Find information on just about anything on Wikipedia | https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/wikipedia.zip | No API Key required |
| `google_books` | Retrieve information from millions of books | https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/google_books.zip | No API Key required |
| `math` | Performs mathematical calculations, date and unit conversions, formula solving, etc | https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/math.zip | No API Key required |
| `weather` | Get the current weather for a location | https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/weather.zip | [Get free API Key](https://openweathermap.org/) |


The tools in this directory can be added to your `wxflows` project using the `.ZIP` files in this directory. For example, to use the "Wikipedia" tool in your project run the following command:

```bash
wxflows init --endpoint-name api/my-project \
--import-name wikipedia  --import-package https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/wikipedia.zip \
  --import-tool-name wikipedia --import-tool-description "Retrieve information from Wikipedia." --import-tool-fields "search|page"
```

See [create your own tool](#create-your-own-tool) for converting any data source into a tool.


## Editing a tool

You can edit the tool description in the generated `wxflows.toml` file after running this command. Or add a tool at the bottom of the `wxflows.toml` file manually:

```toml
# wxflows.toml
# ...

[[wxflows.deployment.endpoint.imports]]
name = "wikipedia"
package = "https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/wikipedia.zip"

[[wxflows.deployment.endpoint.imports.tools]]
name = "wikipedia"
description = """Retrieve information from Wikipedia."""
fields = "search|page"
```

After editing the `wxflows.toml` file run `wxflows deploy` to make your tools available.

## Create your own tool

To create your own tool, you can use the `stepzen` CLI from [API Connect Essentials](https://dashboard.ibm.stepzen.com/). This CLI can be used to import any data source (Databases; REST, SOAP & GraphQL APIs ) and turn it into a GraphQL schema that `wxflows` can turn into a tool for your GenAI applications and Agents.

The first step is to install the `stepzen` CLI:

```
npm i -g stepzen
```

Create a new directory for your tool, and run the following command:

```
stepzen import 
```

And select the data source you want to import. You can also [automate the imports via the CLI](https://www.ibm.com/docs/en/api-connect/ace/saas?topic=schemas-tutorials-creating-graphql-apis) by using the correct flags/options, or [manually create](https://www.ibm.com/docs/en/api-connect/ace/saas?topic=schemas-connecting-backends-custom-directives) the GraphQL schema files.


Once you've generate the GraphQL schema, you need to run the following command from your `wxflows` project:

```bash
wxflows init --endpoint-name api/my-project \
--import-name my-tool  --import-directory 'path/to/graphql' \
  --import-tool-name my-tool --import-tool-description "The description for my custom tooll"
```

The option `--import-directory` points towards the relative directory where the `.graphql` files for your data source are.

## Share your tool

If you want to share your tool with others, you need to create a `.ZIP` file out of your `.graphql` files. On Macs can do this by running the command:

```
zip -r mydir.zip mydir
```

You can share the created `.zip` file with others or contribute to this repository.



