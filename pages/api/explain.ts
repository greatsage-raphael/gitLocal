import type { NextApiRequest, NextApiResponse } from "next";
import Replicate from 'replicate'

type Data = any;

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    code: string;
  };
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || '',
})

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<Data>
) {


  // POST request to LLAMA_70 Replicate to explain the code contents
  const code = req.body.code;
  //console.log("New Age", code)

   // Create a prediction with the stream option set to true
   const prediction = await replicate.predictions.create({
    version: 'meta/codellama-70b-instruct:a279116fe47a0f65701a8817188601e2fe8f4b9e04a518789655ea7b995851bf',
    input: { prompt: code, system_prompt: "Explain the code sample as best as you can." },
    stream: true,
  });

  //const outputLines = output as string[];

  console.log("OutPut", prediction)

  res.send(prediction)
  
  
   
}