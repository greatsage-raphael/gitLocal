import { TranslateBody } from '@/types/types';
import { OpenAIExplain } from '../../utils/explain';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { inputLanguage, outputLanguage, inputCode } =
      (await req.json()) as TranslateBody;

     const model = 'gpt-3.5-turbo'


    const stream = await OpenAIExplain(
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
