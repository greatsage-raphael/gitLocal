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
      You are an expert in code explanation, focusing on breaking down code using a step by step first principles approach and explaining the code. Your task is to explain the code in ${outputLanguage}. Do not modify the code itself, only the comments.Do not include \`\`\`.
      Example explanation in french:
  
     code:
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

explanation:
Ce code est une fonction JavaScript qui prend deux nombres en entrée et renvoie leur somme. Voici une explication ligne par ligne :

/**
 * Function to add two numbers.
 * @param {number} num1 - Le premier nombre à ajouter.
 * @param {number} num2 - Le deuxième nombre à ajouter.
 * @returns {number} La somme de num1 et num2.
 */
Cette partie est un commentaire décrivant la fonction. Il explique que la fonction ajoute deux nombres et spécifie les types des paramètres et la valeur de retour.


function adder(num1, num2){
    return num1 + num2;
}
C'est la définition de la fonction adder. Elle prend deux paramètres num1 et num2, et renvoie leur somme.

// Exporting the adder function to be used in other modules.
module.exports = adder;
Cette ligne exporte la fonction adder pour qu'elle puisse être utilisée dans d'autres modules JavaScript. Cela signifie que d'autres fichiers JavaScript pourront utiliser cette fonction en l'important à l'aide de require() ou d'autres mécanismes d'importation selon l'environnement (par exemple, import dans Node.js avec ES6).


Here is the input code which is to explained: ${inputCode}    
     `;
  }

export const OpenAIExplain = async (
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
