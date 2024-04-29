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
  if (!articleToTranslate) {
    return new Response(false, { status: 404 });
  }
  if (
    articleToTranslate.translatedArticle.find(
      (articleInLanguage: any) => articleInLanguage.articleLanguage === language
    )
  ) {
    return new Response(true);
  }

  const woerterBuch = articleToTranslate.articleContent.woerterBuch.map(
    (entry: {
      woerterBuchEintragTitel: string;
      woerterBuchEintragDescription: string;
    }) => {
      return `${entry.woerterBuchEintragTitel}: ${entry.woerterBuchEintragDescription}`;
    }
  );

  const articleAsArray = [
    articleToTranslate.title,
    articleToTranslate.articleDescription,
    articleToTranslate.imageDescription,
    articleToTranslate.articleContent.imageCaption,
    articleToTranslate.articleContent.textContent,
  ];

  const articleImage = articleToTranslate.image;

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

  const rebuiltTranslatedArticle = {
    title: translatedArticle[0].text,
    articleDescription: translatedArticle[1].text,
    imageDescription: translatedArticle[2].text,
    imageCaption: translatedArticle[3].text,
    image: articleImage,
    articleContent: {
      textContent: translatedArticle[4].text,
      woerterBuch: translaterWoerterBuch.map((entry: string) => {
        const oneEntry = entry.text.split(". ");

        const title = oneEntry.shift();
        const description = oneEntry.join(". ");

        return {
          woerterBuchEintragTitel: title,
          woerterBuchEintragDescription: description,
        };
      }),
    },
  };

  return new Response(
    await writeTranslatedArticleToDB(
      rebuiltTranslatedArticle,
      articleToTranslate,
      language
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
