import wxflows from 'wxflows'

export async function getAnswer(question) {
    const model = new wxflows({
        endpoint: import.meta.env.VITE_WXFLOWS_ENDPOINT,
        apikey: import.meta.env.VITE_WXFLOWS_APIKEY,
    })

    const schema = await model.generate()

    // Make sure these match your values in `wxflows.toml`
    const flowName = 'myRag'
    const collection = 'watsonxdocs'

    const result = await model.ragAnswer({
        schema,
        flowName,
        variables: {
            n: 5,
            question,
            aiEngine: 'WATSONX',
            model: 'ibm/granite-13b-chat-v2',
            collection,
            parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                stop_sequences: ['\n\n'],
            },
            searchEngine: 'GETTINGSTARTED',
        },
    })

    return result?.data?.[flowName]?.out?.modelResponse?.results[0]?.generated_text;
}