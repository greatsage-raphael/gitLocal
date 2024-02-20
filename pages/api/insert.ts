import { supabaseAdmin } from "../../scripts/admin";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = any;

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    git_id: number;
    name: string;
    username: string;
    avatar_url: string;
    web_url: string;
    email: string;
    resultlist: {
      inputcode: string;
      outputcode: string;
      originalreporturl: string;
    }[];
  };
}

async function insertData(reqBody: ExtendedNextApiRequest['body']) {
  try {
    const { data, error } = await supabaseAdmin
      .from('gittranslateusers')
      .insert([
        {
          git_id: reqBody.git_id,
          name: reqBody.name,
          username: reqBody.username,
          avatar_url: reqBody.avatar_url,
          web_url: reqBody.web_url,
          email: reqBody.email,
          resultlist: reqBody.resultlist,
        },
      ])
      .select();
      
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
    const { git_id, name, username, avatar_url, web_url, email, resultlist } = req.body;

    console.log("ResultList", resultlist)

    // Insert dummy data into the database
    const insertedData = await insertData({ git_id, name, username, avatar_url, web_url, email, resultlist });

    res.status(200).json(insertedData);
  } catch (error) {
    console.error("Error inserting dummy data:", error);
    res.status(500).json({ error: "An error occurred while inserting dummy data" });
  }
}
