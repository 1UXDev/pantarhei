import * as deepl from "deepl-node";
import Articles from "@/app/utils/db/models/Articles";
import TranslatedArticles from "@/app/utils/db/models/TranslatedArticles";
import dbConnect from "@/app/utils/db/dbConnect";
import { Article } from "@/app/utils/types/Article";
import axios from "axios";
import cheerio from "cheerio";

interface RouteParams {
  language: deepl.TargetLanguageCode;
  slug: string;
}

interface AC {
  title: string;
  imageCaption: string;
  textContent: string;
  dict: { oneDictTitle: string; oneDictDescription: string }[];
}

// scrape a specific article
// --> we do not really need this route anymore

// export async function GET(
//   request: Request,
//   { params }: { params: RouteParams }
// ) {
//   const { slug, language } = params;
//   await dbConnect();

//   const scrapedArticleContent = await scrapeArticle(slug);
//   const updatedArticle = await writeArticleToDB(
//     language,
//     slug,
//     scrapedArticleContent
//   );

//   return new Response(JSON.stringify(updatedArticle));
// }

export async function scrapeArticle(slug: string) {
  try {
    const url = `https://www.nachrichtenleicht.de/${slug}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let aC: AC = {
      title: "",
      imageCaption: "",
      textContent: "",
      dict: [],
    };

    // scrape the article
    $(".b-article").each((index, element) => {
      aC.title = $(element).find(".headline-title").text().trim();
      aC.imageCaption = $(element).find(".caption-figure").text().trim();
      aC.textContent = $(element).find(".article-details-text").text().trim();
    });

    // scrape the dictionary
    $(".list-teaser-word-item").each((index, element) => {
      const oneDictTitle = $(element).find(".teaser-word-title").text().trim();
      const oneDictDescription = $(element)
        .find(".teaser-word-description")
        .text()
        .trim();

      aC.dict.push({ oneDictTitle, oneDictDescription });
    });

    return aC;
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function writeArticleToDB(
  language: string,
  slug: string,
  scrapedArticleContent: AC
) {
  const updatedArticle = await Articles.findOneAndUpdate(
    {
      slug: slug,
      "textContent.articleLanguage": language,
    },
    {
      $set: {
        "textContent.$.articleContent.title": scrapedArticleContent.title,
        "textContent.$.articleContent.imageCaption":
          scrapedArticleContent.imageCaption,
        "textContent.$.articleContent.textContent":
          scrapedArticleContent.textContent,
        "textContent.$.articleContent.dict": scrapedArticleContent.dict,
      },
    },
    { new: true }
  );

  if (!updatedArticle) {
    return new Response("Article not found in DB", { status: 404 });
  }

  return updatedArticle;
}
