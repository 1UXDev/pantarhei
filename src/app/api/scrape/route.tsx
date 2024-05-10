import axios from "axios";
import cheerio from "cheerio";
import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";
import { ArticleCard } from "@/app/utils/types/ArticleCard";
import { scrapeArticle } from "./[language]/[slug]/route";

// Scrape the landing page of the Nachrichtenleicht website

export async function GET(request: Request): Promise<Response> {
  async function articleDoesNotExistYet(slug: string) {
    await dbConnect();

    console.log("Checking if article exists in the database");
    const articlesFound = await Articles.findOne({ slug: slug });
    console.log("articlesFound", articlesFound ? true : false);

    return articlesFound === null ? true : false;
  }

  try {
    const url = `https://www.nachrichtenleicht.de/nachrichtenleicht-nachrichten-100.html`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let results = [];

    const articles = $("article").toArray();

    for (let element of articles) {
      const slug = $(element)
        .find("a")
        .attr("href")
        ?.split(".de/")[1]
        .toString();

      if (slug && (await articleDoesNotExistYet(slug))) {
        let image = $(element).find("img").attr("src");

        // Convert relative URL to absolute URL
        if (image && !image.startsWith("http")) {
          image = new URL(image, url).toString();
        }

        // Scrape the individual articles content
        const scrapedArticleContent = await scrapeArticle(slug);

        const updatedArticle = await Articles.create({
          slug: slug,
          textContent: [
            {
              articleLanguage: "de-DE",
              articleImage: image,
              articleTeaser: {
                title: $(element).find(".headline-title").text().trim(),
                imageDescription: $(element).find("img").attr("alt")?.trim(),
                articleDescription: $(element).find("p").text().trim(),
              },
              articleContent: scrapedArticleContent,
            },
          ],
        });

        results.push({ status: "created", article: updatedArticle });
      } else {
        console.log(slug, "already exists in the database");
        results.push({ status: "exists", slug: slug });
      }
    }

    return new Response(JSON.stringify(results), {
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
