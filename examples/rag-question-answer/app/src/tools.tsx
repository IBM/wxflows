import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const calculatorSchema = z.object({
  operation: z
    .enum(["add", "subtract", "multiply", "divide"])
    .describe("The type of operation to execute."),
  number1: z.number().describe("The first number to operate on."),
  number2: z.number().describe("The second number to operate on."),
});

export const calculatorTool = tool(async ({ operation, number1, number2 }) => {
    if (operation === "add") {
      return `${number1 + number2}`;
    } else if (operation === "subtract") {
      return `${number1 - number2}`;
    } else if (operation === "multiply") {
      return `${number1 * number2}`;
    } else if (operation === "divide") {
      return `${number1 / number2}`;
    } else {
      throw new Error("Invalid operation.");
    }
  }, {
    name: "calculator",
    description: "Can perform mathematical operations.",
    schema: calculatorSchema,
  });
  

export const getCalculatorToolML = async (calculatorTool: any, userMessage: string, operation: string) => {
    // Extract operation and numbers using a regex
    const match = userMessage.match(/What is (\d+) \* (\d+)/);
    if (!match) {
      throw new Error("Could not parse the question.");
    }
  
    const number1 = parseFloat(match[1]);
    const number2 = parseFloat(match[2]);
  
    // Invoke the calculator tool
    const result = await calculatorTool.invoke({
      operation,
      number1,
      number2,
    });
  
    return `The result of ${number1} * ${number2} is ${result}.`;
}