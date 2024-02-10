"use server";
import axios from "axios";
import { CheerioAPI } from "cheerio";

export default async function scrapeArticle() {
  async function create(req) {
    "use server";
    console.log("req.query", req.query);
    // ...
  }

  return <h1>Hello World</h1>;

  // const { newsPageSlug, articleSlug } = req.query;
  // try {
  //   const url = `https://${newsPageSlug}.de/${articleSlug}`;
  //   const response = await axios.get(url);
  //   const html = response.data;
  //   const $ = cheerio.load(html);
  //   let articles = [];
  //   $(".b-article").each((index, element) => {
  //     const title = $(element).find(".headline-title").text().trim();
  //     const textContent = $(element)
  //       .find(".article-details-text")
  //       .text()
  //       .trim();
  //     const woerterBuch = $(element)
  //       .find(".teaser-word-description")
  //       .text()
  //       .trim();
  //     articles.push({
  //       title,
  //       textContent,
  //       woerterBuch,
  //     });
  //   });
  //   res.status(200).json({ articles: articles });
  // } catch (error) {
  //   res.status(500).json({ error: "Error occurred while fetching data" });
  // }
}
