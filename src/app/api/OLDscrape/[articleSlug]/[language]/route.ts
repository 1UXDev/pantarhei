import * as deepl from "deepl-node";
import Articles from "@/app/utils/db/models/Articles";
import TranslatedArticles from "@/app/utils/db/models/TranslatedArticles";
import dbConnect from "@/app/utils/db/dbConnect";

interface RouteParams {
  language: deepl.TargetLanguageCode;
  articleSlug: string;
}

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  if (!process.env.DEEPL_API_KEY || !process.env.BASE_URL) {
    return new Response("Environment variables not set", { status: 500 });
  }

  const { language, articleSlug } = params;
  await dbConnect();

  // check if article exists for this language in the db
  // if it does, return the article
  // if it doesn't, call the scrape api route to get the article
  console.log("Article slug:", articleSlug);
  const articleInDBResponse = await Articles.findOne({ slug: articleSlug });

  if (!articleInDBResponse) {
    console.log("Article not found in DB");
    return new Response("Articles not found in DB", { status: 404 });
  } else if (
    articleInDBResponse.translatedArticle.find(
      (translation: any) => translation.articleLanguage === language
    )
  ) {
    console.log("Article found in DB with this language", language);
    // populate with this object in array, that has articleLanguage === language
    // structure: "translatedArticle":[{"articleLanguage":"en-GB","_id":"66156762f6d631f1c363480c"},{"articleLanguage":"fr","translatedArticleInLanguage":"66156993eb43f531cd71a8d7","_id":"66156994eb43f531cd71a8dc"}]}
    const articleWithTranslation = await Articles.findById({
      _id: articleInDBResponse._id,
    }).populate({
      path: "translatedArticle",
      match: { articleLanguage: language },
      populate: { path: "translatedArticleInLanguage" },
    });
    return new Response(JSON.stringify(articleWithTranslation));
  } else {
    console.log("Article found in DB but not with this language");

    const newlyScrapedAndTranslated = await scrapeAndTranslate(
      articleInDBResponse,
      language
    );

    // return newlyScrapedAndTranslated;
    return new Response(JSON.stringify(newlyScrapedAndTranslated));
  }
}

async function scrapeAndTranslate(
  articleResponse: any,
  language: deepl.TargetLanguageCode
) {
  // Translate the article

  const woerterBuch = articleResponse.articleContent.woerterBuch.map(
    (entry: {
      woerterBuchEintragTitel: string;
      woerterBuchEintragDescription: string;
    }) => {
      return `${entry.woerterBuchEintragTitel}: ${entry.woerterBuchEintragDescription}`;
    }
  );

  const articleAsArray = [
    articleResponse.title,
    articleResponse.articleDescription,
    articleResponse.imageDescription,
    articleResponse.articleContent.imageCaption,
    articleResponse.articleContent.textContent,
  ];

  const articleImage = articleResponse.image;

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

  return await writeTranslatedArticleToDB(
    rebuiltTranslatedArticle,
    articleResponse,
    language
  );
}
async function writeTranslatedArticleToDB(
  translatedArticle: any,
  articleResponse: any,
  language: deepl.TargetLanguageCode
) {
  // writing the new content to TranslatedArticles
  const newTranslatedArticle = {
    originalArticleId: articleResponse._id,
    articleLanguage: language,
    translatedArticleInLanguage: translatedArticle,
  };

  const translatedArticleInDB = await TranslatedArticles.create(
    newTranslatedArticle
  );

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

  return translatedArticleInDB;
}
