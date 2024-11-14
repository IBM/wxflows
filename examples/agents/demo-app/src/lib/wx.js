

export default async function getAnswerFromWatsonx(tools, messages) {
    let result = await callWxFlows('wx_chatContent', 'mistralai/mistral-large', messages, tools);

    if (
        result?.[0]?.finish_reason === "tool_calls" &&
        result[0].message?.role === "assistant"
    ) {
        messages.push({
            role: result[0].message.role,
            content: result[0].message.content,
            tool_calls: result[0].message.tool_calls,
        });

        if (result[0].message.tool_calls) {
            const toolCallMessages = result[0].message.tool_calls.map((tool_call) => {
                if (tool_call.id === undefined || tool_call.function === undefined) {
                    return undefined;
                }

                return {
                    role: "tool",
                    tool_call_id: tool_call.id,
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(tool_call.function.result),
                        },
                    ],
                };
            });
            messages.push(...toolCallMessages.filter(Boolean));
        }

        return getAnswerFromWatsonx(messages);
    }

    const message = result?.[0].message || {
        role: "assistant",
        content: "",
    };
    messages.push(message);

    return message;
}