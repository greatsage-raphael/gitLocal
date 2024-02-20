import { supabaseAdmin } from "../../scripts/admin";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = any;

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    git_id: number;
    inputcode: string;
    outputcode: string;
    originalreporturl: string;
  };
}

async function UpdateData(reqBody: ExtendedNextApiRequest['body']) {
  try {
    // Fetch current data
    const { data: currentData, error: fetchError } = await supabaseAdmin
      .from('gittranslateusers')
      .select('resultlist')
      .eq('git_id', reqBody.git_id); //update where git_id === user git id

    if (fetchError) {
      throw fetchError;
    }

    // Append new data to the existing resultlist or initialize if it's null
    const updatedData = currentData[0]?.resultlist ? [...currentData[0].resultlist, {
      inputcode: reqBody.inputcode,
      outputcode: reqBody.outputcode,
      originalreporturl: reqBody.originalreporturl
    }] : [{
      inputcode: reqBody.inputcode,
      outputcode: reqBody.outputcode,
      originalreporturl: reqBody.originalreporturl
    }];

    // Update the database with the combined data
    const { data: updatedResult, error: updateError } = await supabaseAdmin
      .from('gittranslateusers')
      .update({ resultlist: updatedData })
      .eq('git_id', reqBody.git_id);

    if (updateError) {
      throw updateError;
    }

    return updatedResult;
  } catch (error) {
    throw error;
  }
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { git_id, inputcode, outputcode, originalreporturl } = req.body;

    // Update the data
    const updatedData = await UpdateData({ git_id, inputcode, outputcode, originalreporturl });

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
}
