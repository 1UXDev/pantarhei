import axios from "axios";
import cheerio, { CheerioAPI } from "cheerio";

interface Article {
  title: string;
  articleDescription?: string;
  textContent: string;
  image?: string;
  imageDescription?: string;
  imageCaption?: string;
}

interface WoerterBuch {
  woerterBuchEintragTitel: string;
  woerterBuchEintragDescription: string;
}

export async function GET(
  request: Request,
  { params: { articleSlug } }: { params: { articleSlug: string } }
) {
  console.log(articleSlug);
  try {
    const url = `https://nachrichtenleicht.de/${articleSlug}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let article: Article[] = [];
    let woerterBuch: WoerterBuch[] = [];

    $(".b-article").each((index, element) => {
      const title = $(element).find(".headline-title").text().trim();
      const articleDescription = $(element)
        .find(".article-header-description")
        .text();
      const image = $(element).find("img").attr("src");
      const imageDescription = $(element).find("img").attr("alt");
      const imageCaption = $(element).find(".caption-figure").text().trim();
      const textContent = $(element)
        .find(".article-details-text")
        .text()
        .trim();

      article.push({
        title,
        articleDescription,
        image,
        imageDescription,
        imageCaption,
        textContent,
      });
    });

    $(".list-teaser-word-item").each((index, element) => {
      const woerterBuchEintragTitel = $(element)
        .find(".teaser-word-title")
        .text()
        .trim();
      const woerterBuchEintragDescription = $(element)
        .find(".teaser-word-description")
        .text()
        .trim();

      woerterBuch.push({
        woerterBuchEintragTitel,
        woerterBuchEintragDescription,
      });
    });
    console.log("article without translation", article);

    return Response.json({ article: article, woerterBuch: woerterBuch });
  } catch (error) {
    return Response.json({ error: "Error occurred while fetching data" });
  }
}
