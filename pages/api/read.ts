import { supabaseAdmin } from "../../scripts/admin";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = any;

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    git_id: number;
  };
}

async function ReadData(reqBody: ExtendedNextApiRequest['body']) {
  try {

let { data, error } = await supabaseAdmin
.from('gittranslateusers')
.select('resultlist')
.eq('git_id', reqBody.git_id); //read where git_id === user git id

if (error) {
    throw error;
  }

  return data;
  } catch (error) {
    throw error;
  }
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { git_id } = req.body;

    // Update the data
    const updatedData = await ReadData({ git_id });

    //console.log("Data :", updatedData)

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: "An error occurred while reading data" });
  }
}
