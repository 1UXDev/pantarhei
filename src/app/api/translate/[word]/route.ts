import dbConnect from "@/app/utils/db/dbConnect";
import mongoose from "mongoose";
import Words from "@/app/utils/db/models/Words";

interface RouteParams {
  word: string;
}

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { word } = params;

  try {
    // Establish the database connection
    await dbConnect();

    // Since all words are in the 'words' collection, query directly
    const foundWord = await Words.findOne({ "spanish.word": word });
    console.log("Found Word:", foundWord);

    // If the word is not found, return an appropriate message
    if (!foundWord) {
      return new Response(JSON.stringify({ message: "Word not found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(foundWord), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "there was an error" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
