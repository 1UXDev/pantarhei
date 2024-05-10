import * as deepl from "deepl-node";
import Articles from "@/app/utils/db/models/Articles";
import TranslatedArticles from "@/app/utils/db/models/TranslatedArticles";
import dbConnect from "@/app/utils/db/dbConnect";

interface RouteParams {
  language: deepl.TargetLanguageCode;
  articleSlug: string;
}

// ------------
// Function translates Articles and returns true if successful, false if not
// ------------

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  if (!process.env.DEEPL_API_KEY || !process.env.BASE_URL) {
    return new Response("Environment variables not set", { status: 500 });
  }

  const { language, articleSlug } = params;
  console.log(
    "translating article in API route-----------------------------------------------------",
    articleSlug,
    language
  );
  await dbConnect();

  const articleToTranslate = await Articles.findOne({ slug: articleSlug });

  // check if article exists
  if (!articleToTranslate) {
    return new Response(false, { status: 404 });
  }

  // check if article is already translated to target lang
  if (
    articleToTranslate.textContent.find(
      (articleInLanguage: any) => articleInLanguage.articleLanguage === language
    )
  ) {
    return new Response(false, {
      status: 409,
      statusText: "Already translated",
    });
  }

  const aTT = articleToTranslate.textContent[0];

  const woerterBuch = aTT.articleContent.dict.map(
    (entry: { oneDictTitle: string; oneDictDescription: string }) => {
      return `${entry.oneDictTitle}: ${entry.oneDictDescription}`;
    }
  );

  const articleAsArray = [
    aTT.articleContent.title,
    aTT.articleTeaser.articleDescription,
    aTT.articleTeaser.imageDescription,
    aTT.articleContent.imageCaption,
    aTT.articleContent.textContent,
  ];

  const articleImage = aTT.articleImage;

  const translator = new deepl.Translator(process.env.DEEPL_API_KEY);
  const translatedArticle = await translator.translateText(
    articleAsArray,
    null,
    language
  );
  const translatedWoerterBuch = await translator.translateText(
    woerterBuch,
    null,
    language
  );

  const rebuiltTranslatedArticle = {
    slug: articleToTranslate.slug,
    textContent: [
      {
        articleLanguage: language,
        articleImage: articleImage,
        articleTeaser: {
          title: translatedArticle[0].text,
          imageDescription: translatedArticle[2].text,
          articleDescription: translatedArticle[1].text,
        },
        articleContent: {
          title: translatedArticle[0].text,
          imageCaption: translatedArticle[3].text,
          textContent: translatedArticle[4].text,
          dict: translatedWoerterBuch.map((entry: string) => {
            const oneEntry = entry.text.split(": ");

            const title = oneEntry.shift();
            const description = oneEntry.join(": ");

            return {
              oneDictTitle: title,
              oneDictDescription: description,
            };
          }),
        },
      },
    ],
  };

  const updatedArticle = await Articles.findOneAndUpdate(
    { _id: articleToTranslate._id },
    {
      $push: {
        textContent: rebuiltTranslatedArticle.textContent,
      },
    },
    { new: true }
  );

  if (!updatedArticle) {
    return new Response(false, { status: 500 });
  }

  return new Response(updatedArticle, { status: 200 });
}
