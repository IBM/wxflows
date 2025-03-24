const playwright = require('playwright');
const wxflows = require('wxflows');

async function getWebsiteContents(url, locator) {
    const browser = await playwright['chromium'].launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);

    const text = await page.locator(locator).innerText();

    await browser.close();

    return text
};

(async () => {
    const WXFLOWS_ENDPOINT = ''
    const WXFLOWS_APIKEY = ''

    if (!WXFLOWS_ENDPOINT || !WXFLOWS_APIKEY) {
        console.log('Please set the environment variables for your Endpoint and Api Key')
        return null;
    }

    const model = new wxflows({
        endpoint: WXFLOWS_ENDPOINT,
        apikey: WXFLOWS_APIKEY
    })

    const content = await getWebsiteContents(
        "https://developer.ibm.com/tutorials/awb-build-rag-application-watsonx-ai-flows-engine/",
        '.content-data'
    )

    const schema = await model.generate();
    const result = await model.flow({
        flowName: 'summarization',
        schema,
        variables: {
            aiEngine: 'WATSONX',
            model: 'ibm/granite-13b-instruct-v2',
            question: content,
            parameters: {
                min_new_tokens: 100,
                max_new_tokens: 1000,
                stop_sequences: []
            }
        }
    })

    console.log('Summary: ', result?.data?.summarization?.out?.results[0]?.generated_text)
})();
