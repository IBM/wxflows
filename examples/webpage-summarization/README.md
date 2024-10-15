Copyright IBM Corp. 2020, 2024

# Summarization Example | IBM watsonx.ai Flows Engine

This is an example summarization tool built using watsonx.ai Flows Engine. You can recreate the content in this directory by following along this [tutorial](https://developer.ibm.com/tutorials/awb-build-web-page-summarization-tool-watsonx-ai-flows-engine). The example tool takes a webpage, scrapes its content and uses a LLM to summarize it.

## Deploy the flows

To deploy the summarization flow, make sure to [install](https://watzen.ibm.stepzen.com/docs/installation) and [authenticate](https://watzen.ibm.stepzen.com/docs/authentication) the `wxflows` CLI. Then add your credentials to watsonx.ai in the `.env` file or use the shared "getting started" instance:

```bash
# Shared "getting started"
STEPZEN_WATSONX_HOST=shared

# Your own watsonx.ai credentials (optionally)
# STEPZEN_WATSONX_AI_TOKEN=
# STEPZEN_WATSONX_HOST=
# STEPZEN_WATSONX_PROJECTID=
```

Then you can run the command `wxflows deploy` to deploy your flows to a live endpoint.

## Run the example

To use the summarization tool, move into the `app` directory and add your flows endpoint and api key in `index.js`:

```js
// ...

(async () => {
    const WXFLOWS_ENDPOINT = 'YOUR_ENDPOINT_HERE'
    const WXFLOWS_APIKEY = 'YOUR_APIKEY_HERE'

    // ... everything else

})();
```

> You can retrieve your api key from the dashboard or by running the CLI command `wxflows whoami --apikey`.

Change the below details in `index.js` to use a different URL and locator to scrape content from:

```js
const content = await getWebsiteContents(
    "https://developer.ibm.com/tutorials/awb-build-rag-application-watsonx-ai-flows-engine/",
    '.content-data'
)
```

To run the summarization tool use `node index.js`, the result should be printed in your terminal.

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!
