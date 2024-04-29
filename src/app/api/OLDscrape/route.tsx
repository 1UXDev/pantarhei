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
  async function checkIfArticleExists(slug: string) {
    await dbConnect();

    const article = await Articles.find({ slug });

    return article.length == 0;
  }

  try {
    const url = `https://www.nachrichtenleicht.de/nachrichtenleicht-nachrichten-100.html`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let articleList: ArticleCard[] = [];

    const articles = $("article").toArray();

    for (let element of articles) {
      const slug = $(element)
        .find("a")
        .attr("href")
        ?.split(".de/")[1]
        .toString();

      if (slug && (await checkIfArticleExists(slug))) {
        // call api route to scrape article contents
        const res = await fetch(`${process.env.BASE_URL}/api/scrape/${slug}`);

        // const title = $(element).find(".headline-title").text().trim();
        // const articleDescription = $(element).find("p").text().trim();
        // let image = $(element).find("img").attr("src");
        // const imageDescription = $(element).find("img").attr("alt")?.trim();

        // // Convert relative URL to absolute URL
        // if (image && !image.startsWith("http")) {
        //   image = new URL(image, url).toString();
        // }

        // let articleCard: ArticleCard = {
        //   title,
        //   articleDescription,
        //   image: image || "",
        //   imageDescription: imageDescription || "",
        //   slug: slug || "",
        // };

        // articleList.push(articleCard);
      } else {
        console.log(slug, "already exists in the database");
        break;
      }
    }

    return new Response(JSON.stringify({ message: "articles scraped to DB" }), {
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
