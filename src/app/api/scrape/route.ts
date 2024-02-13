import axios from "axios";
import cheerio from "cheerio";

interface Article {
  title: string;
  articleDescription?: string;
  image?: string;
  imageDescription?: string;
  slug: string;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = `https://www.nachrichtenleicht.de/nachrichtenleicht-nachrichten-100.html`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let articleList: Article[] = [];

    $("article").each((index, element) => {
      const title = $(element).find(".headline-title").text().trim();

      const articleDescription = $(element).find("p").text().trim();

      let image = $(element).find("img").attr("src");
      const imageDescription = $(element).find("img").attr("alt")?.trim();
      const slug = $(element).find("a").attr("href")?.split(".de/")[1];

      // Convert relative URL to absolute URL
      if (image && !image.startsWith("http")) {
        image = new URL(image, url).toString();
      }

      let article = {
        title,
        articleDescription,
        image,
        imageDescription,
        slug,
      };

      articleList.push(article);
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
