import axios from "axios";
import cheerio from "cheerio";
import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";

type ArticleCard = {
  slug: string;
  title: string;
  articleDescription: string;
  image: string;
  imageDescription: string;
};

export async function GET(request: Request): Promise<Response> {
  try {
    await dbConnect();
    const articles = await Articles.find().sort({ createdAt: -1 }).limit(1);
    return new Response(JSON.stringify(articles), {
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

  try {
    const url = `https://www.nachrichtenleicht.de/nachrichtenleicht-nachrichten-100.html`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let articleList: ArticleCard[] = [];

    $("article").each((index, element) => {
      const title = $(element).find(".headline-title").text().trim();

      const articleDescription = $(element).find("p").text().trim();

      let image = $(element).find("img").attr("src");
      const imageDescription = $(element).find("img").attr("alt")?.trim();
      const slug = $(element)
        .find("a")
        .attr("href")
        ?.split(".de/")[1]
        .toString();

      // Convert relative URL to absolute URL
      if (image && !image.startsWith("http")) {
        image = new URL(image, url).toString();
      }

      let articleCard: ArticleCard = {
        title,
        articleDescription,
        image: image || "",
        imageDescription: imageDescription || "",
        slug: slug || "",
      };

      articleList.push(articleCard);
    });

    return new Response(JSON.stringify({ articleList }), {
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
