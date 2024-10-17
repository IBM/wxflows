import React, { useEffect, useState } from 'react';
import { WebChatCustomElement, setEnableDebug } from '@ibm-watson/assistant-web-chat-react';
import { customSendMessage, fetchTools } from './helpers';
import './App.css'

// Include this if you want to get debugging information from this library. Note this is different than
// the web chat "debug: true" configuration option which enables debugging within web chat.
setEnableDebug(true);

const createSystemPrompt = (tools) => `You are a helpful assistant that is going to assist business users with their questions.
- The output that you generate will be post processed using the Handlebars framework before being sent to the user.
- You will use a series of tools to achieve your goals.
- The tools are using GraphQL. When creating a GraphQL operation always use double quotes for input parameters

These are the tools you have at your disposal:

${JSON.stringify(tools)}

Many tools take jsonata as input.  A few tips and tricks to remember when using jsonata.

## Formatting

Make sure the JSON encoding is correctly when using the tools, don't use too many backslashes.

## jsonata tips

- KEEP THE JSONATA AS SIMPLE AS POSSIBLE AND ONLY USE FUNCTIONS IF YOU ABSOLUTELY HAVE TO
- Do not start your jsonata with '[].' as the subsequent operation is operating over an empty set. '$[].' may often be a better choice.
- When projecting data from deeper in the json to a higher level this is done using the $.{} operation.  An example
    $.{
      "Name": Name,
      "Description": Description,
      "SKU": SKU,
      "Price": __data__.data.price
      "Child SKU Count": $count(__data__.data.childskus)
    }
- Make use of the '%.' parent operator which can reference values of parent structures
  e.g. '%.orderName' can refer to the orderName of the order that an order line item is a part of
- If you are asked to calculate something, do not put the unit in the value, instead put the unit in the column title, i.e. if you are calculating a number then the result should be a number in the json and NOT a string.  This is due to it potentially being used for further calculations.
- If you do need a function remember that a functions body is made up of one or more expressions
- When an items field name has special characters in it then surround it with double quotes
    for example if a field name is "Price ($s)" then the field can be referenced as '$."Price ($s)"' (don't forget the appropriate prefix based on context e.g. '$.', '$item.', without this the value will just be the field name)
- If you need multiple expressions (in a function) they must be grouped in parentheis ()
    an example function defintion is below
      $exampleFunction := function($x, $y) {
        (
            $sum := $x + $y;
            $product := $x * $y;
            $sum + $product
        )
      };
- When using the $sort function remember that it's signature is $sort(array, function)
    simple example - $sort($, "displayName")
    more complicated example - $sort($, function($a, $b) { $a.displayName > $b.displayName })
- The $millis() function returns the number of milliseconds since the Unix Epoch (1 January, 1970 UTC) as a number
    Example
    $millis() => 1502700297574
- When using the $map() function remember that it's signature is $map(array, function)
    Examples
      $map([1..5], $string) => ["1", "2", "3", "4", "5"]

      $map(Email.address, function($v, $i, $a) {
        'Item ' & ($i+1) & ' of ' & $count($a) & ': ' & $v
      })
`

export default function App() {
  const [tools, setTools] = useState([])

  useEffect(() => {
    fetchTools().then(toolResult => {
      setTools(toolResult)
    })
  }, [])

  if (!tools && !tools.length > 0) return null

  let messages = [
    {
      role: "system",
      content: createSystemPrompt(tools)
    }
  ]

  const webChatOptions = {
    integrationID: "2aec3530-3afa-42c7-9f36-ddb685608e54",
    region: "us-south",
    serviceInstanceID: "9a3613d2-3ce6-4928-8eb6-4d659d87ae68",
    subscriptionID: null,
    themeConfig: {
      useAITheme: true,
      corners: 'square'
    },
    layoutConfig: {
      showFrame: false,
    },
    showLauncher: false,
    openChatByDefault: true,
    hideCloseButton: true,
    messaging: {
      customSendMessage: (request, options, instance) => {
          customSendMessage(request, options, instance, messages)
      }
    },
  };

  return (

    <main className="main">
      <WebChatCustomElement
        className="chat"
        renderUserDefinedResponse={() => {
          console.log(var1, var2)
          return ''
        }}

        config={webChatOptions} />
    </ main>
  )
}

