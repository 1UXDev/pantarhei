import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";

import { translateArticle } from "@/app/api/getTranslation/[slug]/[lang]/route";
import { TargetLanguageCode } from "deepl-node";
import { languages } from "@/app/utils/languages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lang: TargetLanguageCode }> }
) {
  const slug = (await params).slug;
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
    const article = await Articles.findOne({ slug: slug });

    if (!article) {
      return new NextResponse(JSON.stringify({ error: "Article not found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the article in the requested language
    const articleInLanguage = article.textContent.find(
      (articleInLanguage: Article["textContent"][number]) =>
        articleInLanguage.articleLanguage === lang
    );

    // If the article in the requested language does not exist, translate it
    if (!articleInLanguage) {
      const response = await translateArticle(article, lang);
      if (!response) {
        return new NextResponse(
          JSON.stringify({ error: "Translation failed" }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      const updatedArticle = await response.json();

      const newTranslation = updatedArticle.textContent?.find(
        (articleInLanguage: Article["textContent"][number]) =>
          articleInLanguage.articleLanguage === lang
      );

      return new NextResponse(JSON.stringify(newTranslation), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(JSON.stringify(articleInLanguage), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
