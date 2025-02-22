import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";

import { translateArticle } from "@/app/api/getTranslation/[slug]/[lang]/route";
import { TargetLanguageCode } from "deepl-node";
import { languages } from "@/app/utils/languages";

import { ArticleType } from "@/app/utils/types/Article";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lang: TargetLanguageCode }> }
) {
  const slug = (await params).slug;
  const lang = (await params).lang;

  console.log("slug", slug);
  console.log("lang", lang);

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
    // const article = await Articles.findOne({ slug: slug });
    const article = await Articles.findOne(
      {
        slug: slug,
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

    console.log("article in Mongo", article);

    if (!article) {
      // check if article exists in any language
      const articleExists = await Articles.findOne({ slug: slug });

      if (!articleExists) {
        return new NextResponse(
          JSON.stringify({ error: "Article not found" }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        // translate article to requested language
        const response = await translateArticle(articleExists, lang);
        if (!response) {
          return new NextResponse(
            JSON.stringify({ error: "Translation failed" }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        const { translatedArticle } = await response.json();

        const strippedTranslatedArticle = {
          ...translatedArticle,
          textContent: translatedArticle.textContent.filter(
            (content: ArticleType["textContent"][0]) =>
              content.articleLanguage === lang
          ),
        };

        return new NextResponse(JSON.stringify(strippedTranslatedArticle), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new NextResponse(JSON.stringify(article), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
