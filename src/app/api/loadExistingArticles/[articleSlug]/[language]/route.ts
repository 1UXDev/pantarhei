// here we get one existing article from the db when the target language is already in the db

import mongoose from "mongoose";
import Articles from "@/app/utils/db/models/Articles";
import TranslatedArticles from "@/app/utils/db/models/TranslatedArticles";

interface Article {
  title: string;
  articleDescription?: string;
  image?: string;
  imageDescription?: string;
  slug: string;
}

interface RouteParams {
  language: String; // THis follows the int. Standardized lang codes so "de", "en", "es", ...
  articleSlug: String;
}

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { language, articleSlug } = params;
  try {
    const oneExistingArticleWithTranslation = Articles.findById(
      articleSlug
    ).populate({
      path: "translatedArticle.translatedArticleInLanguage",
    });

    return new Response(JSON.stringify({ oneExistingArticleWithTranslation }), {
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
