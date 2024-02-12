import dbConnect from "@/app/utils/db/dbConnect";
import mongoose from "mongoose";
import Words from "@/app/utils/db/models/Words";
import TestModels from "@/app/utils/db/models/TestModels";

export async function GET(request: Request) {
  try {
    // establishing the correct connection
    await dbConnect();
    const collectionName = "pantarhei";
    const username = "julien";

    if (!collectionName) {
      return new Response(
        JSON.stringify({ error: "Invalid collection name" }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // find the translatoion
    const testConnection = await TestModels.findOne({ username: username });
    console.log(testConnection);

    return new Response(JSON.stringify(testConnection), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
