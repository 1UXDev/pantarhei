// here we get one existing article from the db when the target language is already in the db

import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";
import { Article } from "@/app/utils/types/Article";
import * as deepl from "deepl-node";
import TranslatedArticles from "@/app/utils/db/models/TranslatedArticles";

interface RouteParams {
  lang: String; // THis follows the int. Standardized lang codes so "de", "en-GB", "es", ...
  slug: String;
}

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { lang, slug } = params;
  const articleToTranslate = await Articles.findOne({ slug: slug });

  translateArticle(articleToTranslate, lang);
}

export async function translateArticle(articleToTranslate, language) {
  // first entry is always german, but I think it would even work with any input lang
  const woerterBuch = articleToTranslate.textContent[0].articleContent.dict.map(
    (entry: { oneDictTitle: string; oneDictDescription: string }) => {
      return `${entry.oneDictTitle}: ${entry.oneDictDescription}`;
    }
  );

  const item = articleToTranslate.textContent;

  const articleAsArray = [
    item.articleTeaser.title,
    item.articleTeaser.articleDescription,
    item.articleTeaser.imageDescription,
    item.articleContent.imageCaption,
    item.articleContent.textContent,
  ];

  const articleImage = item.image;

  const translator = new deepl.Translator(process.env.DEEPL_API_KEY);
  const translatedArticle = await translator.translateText(
    articleAsArray,
    null,
    language
  );
  const translaterWoerterBuch = await translator.translateText(
    woerterBuch,
    null,
    language
  );

  //   const rebuiltTranslatedArticle = {
  //     title: translatedArticle[0].text,
  //     articleDescription: translatedArticle[1].text,
  //     imageDescription: translatedArticle[2].text,
  //     imageCaption: translatedArticle[3].text,
  //     image: articleImage,
  //     articleContent: {
  //       textContent: translatedArticle[4].text,
  //       woerterBuch: translaterWoerterBuch.map((entry: string) => {
  //         const oneEntry = entry.text.split(". ");

  //         const title = oneEntry.shift();
  //         const description = oneEntry.join(". ");

  //         return {
  //           woerterBuchEintragTitel: title,
  //           woerterBuchEintragDescription: description,
  //         };
  //       }),
  //     },
  //   };

  const rebuiltTranslatedArticle = {
    textContent: [],
  };

  console.log("Rebuilt translated article:", rebuiltTranslatedArticle);

  return await new Response(
    JSON.stringify(
      writeTranslatedArticleToDB(
        rebuiltTranslatedArticle,
        articleToTranslate,
        language
      )
    )
  );
}

async function writeTranslatedArticleToDB(
  translatedArticle: any,
  articleResponse: any,
  language: deepl.TargetLanguageCode
) {
  try {
    // writing the new content to TranslatedArticles
    const newTranslatedArticle = {
      originalArticleId: articleResponse._id,
      articleLanguage: language,
      translatedArticleInLanguage: translatedArticle,
    };

    const translatedArticleInDB = await TranslatedArticles.create(
      newTranslatedArticle
    );

    // console.log("Translated Article in DB:", translatedArticleInDB);

    // writing the new content to the original article
    const updatedArticle = await Articles.findOneAndUpdate(
      { _id: articleResponse._id },
      {
        $push: {
          translatedArticle: {
            articleLanguage: language,
            translatedArticleInLanguage: translatedArticleInDB._id,
          },
        },
      },
      { new: true }
    );

    return true;
  } catch (error) {
    console.error("Error occurred while writing to DB:", error);
    return false;
  }
}
