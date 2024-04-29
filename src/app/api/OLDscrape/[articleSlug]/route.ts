import axios from "axios";
import cheerio, { CheerioAPI } from "cheerio";
import Articles from "@/app/utils/db/models/Articles";
import dbConnect from "@/app/utils/db/dbConnect";

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

    //write to database
    dbConnect();
    const newArticle = await Articles.create({
      title: article[0].title,
      articleDescription: article[0].articleDescription,
      image: article[0].image,
      imageDescription: article[0].imageDescription,
      slug: articleSlug,
      articleContent: {
        textContent: article[0].textContent,
        imageCaption: article[0].imageCaption,
        woerterBuch: woerterBuch,
      },
    });

    return Response.json({ article: article, woerterBuch: woerterBuch });
  } catch (error) {
    return Response.json({ error: "Error occurred while fetching data" });
  }
}
