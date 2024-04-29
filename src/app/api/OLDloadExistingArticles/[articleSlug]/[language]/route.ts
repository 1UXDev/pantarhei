// here we get one existing article from the db when the target language is already in the db

import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";
import * as deepl from "deepl-node";
import TranslatedArticles from "@/app/utils/db/models/TranslatedArticles";

interface Article {
  title: string;
  articleDescription?: string;
  image?: string;
  imageDescription?: string;
  slug: string;
}

interface RouteParams {
  language: String; // THis follows the int. Standardized lang codes so "de", "en-GB", "es", ...
  articleSlug: String;
}

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { language, articleSlug } = params;

  console.log(
    "Fetching article with slug:",
    articleSlug,
    "in language:",
    language
  );

  try {
    await dbConnect();
    const thisArticle = await getArticlePopulated(articleSlug, language);
    console.log("This article:", thisArticle);

    if (!thisArticle) {
      console.log("Article not found, scraping...");
      return await scrapeArticle(articleSlug, language);
    }

    if (language === "de-DE") {
      // return the article as is
      return new Response(JSON.stringify(thisArticle), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hasTranslation = thisArticle.translatedArticle.find(
      (articleInLanguage: any) => articleInLanguage.articleLanguage === language
    );

    console.log("Has translation:", hasTranslation);

    if (!hasTranslation) {
      console.log("Article found but not translated, translating...");
      console.log(
        "Translated article:",
        await translateArticle(thisArticle, language)
      );
      return await translateArticle(thisArticle, language);
    }

    return new Response(JSON.stringify(thisArticle), {
      status: 200,
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

export async function getArticlePopulated(articleSlug, language) {
  if (language === "de-DE") {
    console.log("Getting article without translation...", articleSlug);
    return await Articles.findOne({ slug: articleSlug });
  }

  console.log("Getting article with translation...", articleSlug, language);
  const populatedArticle = await Articles.findOne({
    slug: articleSlug,
  }).populate("translatedArticle.translatedArticleInLanguage");

  return populatedArticle;
}

export async function scrapeArticle(articleSlug, language) {
  // If no article found, scrape it
  await fetch(`${process.env.BASE_URL}/scrape/${articleSlug}/${language}`).then(
    (response) => {
      if (response.status === 404) {
        return new Response("Article not found", { status: 404 });
      }

      return new Response(getArticlePopulated(articleSlug, language));
    }
  );
}

// export async function translateArticle(articleSlug, language) {
//   console.log("Translating article...", articleSlug, language);
//   await fetch(
//     `${process.env.BASE_URL}/translate/document/${articleSlug}/${language}`
//   ).then((response) => {
//     if (response.status === 404) {
//       return new Response("Article not found", { status: 404 });
//     }

//     console.log("Article translated successfully", response);
//     return getArticlePopulated(articleSlug, language);
//   });
// }

export async function translateArticle(articleToTranslate, language) {
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

// why does this code return 4 times?? weird...
