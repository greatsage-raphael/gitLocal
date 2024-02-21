import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const createPrompt = (
  inputLanguage: string,
  outputLanguage: string,
  inputCode: string,
) => {
    return endent`
      You are an expert in localization, focusing on translating comments within code files from one language to another. Your task is to translate the code comments from ${inputLanguage} to ${outputLanguage}, while preserving the code structure and functionality. Do not modify the code itself, only the comments.Do not include \`\`\`.
      Example translating from Mandarin to English:
  
      Mandarin commented code:
      /**
 * 用于将两个数字相加的函数。
 * @param {number} num1 - 要相加的第一个数字。
 * @param {number} num2 - 要相加的第二个数字。
 * @returns {number} num1 和 num2 的和。
 */
function adder(num1, num2){
    return num1 + num2;
}

// 将 adder 函数导出以在其他模块中使用。
module.exports = adder;

  
      English commented code:
      /**
 * Function to add two numbers.
 * @param {number} num1 - The first number to be added.
 * @param {number} num2 - The second number to be added.
 * @returns {number} The sum of num1 and num2.
 */
function adder(num1, num2){
    return num1 + num2;
}

// Exporting the adder function to be used in other modules.
module.exports = adder;


Here is the input code whose code comments in are to be translated: ${inputCode}    
     `;
  }

export const OpenAIStream = async (
  inputLanguage: string,
  outputLanguage: string,
  inputCode: string,
  model: string,
) => {
  const prompt = createPrompt(inputLanguage, outputLanguage, inputCode);

  const system = { role: 'system', content: prompt };

  const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [system],
      temperature: 0,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
