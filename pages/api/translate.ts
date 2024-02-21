import { TranslateBody } from '@/types/types';
import { OpenAIStream } from '@/utils';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { inputLanguage, outputLanguage, inputCode } =
      (await req.json()) as TranslateBody;

     const model = 'gpt-3.5-turbo'


    const stream = await OpenAIStream(
      inputLanguage,
      outputLanguage,
      inputCode,
      model,
    );

    //console.log("stream", stream)

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
