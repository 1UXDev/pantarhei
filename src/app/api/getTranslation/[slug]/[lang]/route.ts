// here we get one existing article from the db when the target language is already in the db

import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";
import { ArticleType } from "@/app/utils/types/Article";
import { TargetLanguageCode } from "deepl-node";
import * as deepl from "deepl-node";
import { languages } from "@/app/utils/languages";

interface RouteParams {
  lang: TargetLanguageCode;
  slug: string;
}

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { lang, slug } = params;

  if (!languages.find((language) => language === lang)) {
    return new Response(JSON.stringify({ error: "Language not supported" }));
  }

  await dbConnect();

  const articleToTranslate = await Articles.findOne({ slug: slug });

  // check if article really does not include the target language already
  if (
    articleToTranslate.textContent.find(
      (content: any) => content.articleLanguage === lang
    )
  ) {
    return new Response(
      JSON.stringify({ error: "Article already exists in target language" })
    );
  }

  if (!articleToTranslate) {
    return new Response(JSON.stringify({ error: "Article not found" }));
  }

  const translatedArticle = translateArticle(articleToTranslate, lang);

  if (!translatedArticle) {
    return new Response(JSON.stringify({ error: "Translation failed" }));
  }

  return new Response(JSON.stringify({ message: "Translation successful" }));
}

export async function translateArticle(
  articleToTranslate: ArticleType,
  language: TargetLanguageCode
) {
  // first entry is always german, but I think it would even work with any input lang
  const articleDict = articleToTranslate.textContent[0].articleContent.dict.map(
    (entry: { oneDictTitle: string; oneDictDescription: string }) => {
      return `${entry.oneDictTitle}: ${entry.oneDictDescription}`;
    }
  );

  const item = articleToTranslate.textContent[0];

  const articleAsArray = [
    item.articleTeaser.title,
    item.articleTeaser.articleDescription,
    item.articleTeaser.imageDescription,
    item.articleContent.imageCaption,
    item.articleContent.textContent,
  ];

  try {
    const translator = new deepl.Translator(process.env.DEEPL_API_KEY!);
    const translatedArticle = await translator.translateText(
      articleAsArray,
      null,
      language
    );
    const translaterWoerterBuch = await translator.translateText(
      articleDict,
      null,
      language
    );

    const rebuiltTranslatedArticle = {
      articleTeaser: {
        title: translatedArticle[0].text,
        articleDescription: translatedArticle[1].text,
        imageDescription: translatedArticle[2].text,
      },
      articleContent: {
        title: translatedArticle[0].text,
        imageCaption: translatedArticle[3].text,
        textContent: translatedArticle[4].text,
        dict: translaterWoerterBuch.map((entry: deepl.TextResult) => {
          const split = entry.text.split(": ");
          return { oneDictTitle: split[0], oneDictDescription: split[1] };
        }),
      },
      articleLanguage: language,
    };

    return new Response(
      JSON.stringify(
        writeTranslatedArticleToDB(rebuiltTranslatedArticle, articleToTranslate)
      )
    );
  } catch (error) {
    console.error("Error occurred while translating:", error);
    return false;
  }
}

async function writeTranslatedArticleToDB(
  translatedArticle: any,
  articleResponse: any
) {
  try {
    // writing the new content to the original article
    const updatedArticle = await Articles.findOneAndUpdate(
      { _id: articleResponse._id },
      {
        $push: {
          textContent: translatedArticle,
        },
      },
      { new: true }
    );

    return updatedArticle;
  } catch (error) {
    console.error("Error occurred while writing to DB:", error);
    return false;
  }
}
