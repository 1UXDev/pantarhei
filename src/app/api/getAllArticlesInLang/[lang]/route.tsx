import { NextRequest, NextResponse } from "next/server";
import { TargetLanguageCode } from "deepl-node";
import { languages } from "@/app/utils/languages";
import { ArticleType } from "@/app/utils/types/Article";
import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";

import { translateArticle } from "@/app/api/getTranslation/[slug]/[lang]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: TargetLanguageCode }> }
) {
  const lang = (await params).lang;

  if (languages.indexOf(lang) === -1) {
    return new NextResponse(
      JSON.stringify({ error: "Language not supported" }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    await dbConnect();
    const articles = await Articles.find(
      {
        "textContent.articleLanguage": lang,
      },
      {
        _id: 1,
        slug: 1,
        image: 1,
        createdAt: 1,
        textContent: {
          $elemMatch: {
            articleLanguage: lang,
          },
        },
      }
    );

    if (!articles) {
      return new NextResponse(JSON.stringify({ error: "No articles found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(JSON.stringify(articles), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Error fetching articles" }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
