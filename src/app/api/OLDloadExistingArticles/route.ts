// here we get all existing articles from the db, but without pop
// in prod we will have to add a date limit here at some point!!

import mongoose from "mongoose";
import Articles from "@/app/utils/db/models/Articles";
import TranslatedArticles from "@/app/utils/db/models/TranslatedArticles";
import dbConnect from "@/app/utils/db/dbConnect";

interface Articles {
  title: string;
  articleDescription?: string;
  image?: string;
  imageDescription?: string;
  slug: string;
  articleContent: {
    imageCaption?: string;
    textContent?: string;
    woertebuch?: [
      {
        woerterBuchEintragTitel: string;
        woerterBuchEintragDescription: string;
      }
    ];
  };
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const allArticlesFromDB = await Articles.find();

    return new Response(JSON.stringify(allArticlesFromDB), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
