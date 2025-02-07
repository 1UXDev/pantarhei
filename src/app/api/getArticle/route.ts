import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const article = await Articles.find();

    return NextResponse.json(article);
  } catch (error) {
    return {
      status: 500,
      body: { error: error },
    };
  }
}
