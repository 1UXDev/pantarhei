import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const message = "Hello World! 123!";

  res.status(200).json({ message });
}

// server.get("/api/scrapeIndex", async (req, res) => {
//   try {
//     const url = "https://www.nachrichtenleicht.de/"; // Replace with the URL of the index page
//     const response = await axios.get(url);
//     const html = response.data;
//     const $ = cheerio.load(html);

//     let links = [];
//     $(".main").each((index, element) => {
//       element.attr === ".article" &&
//         element.each((index, element) => {
//           console.log(element);
//           //   const link = $(element).attr("href");
//           //   const title = $(element).text().trim();
//           //   const image = $(element).find("img").attr("src");
//           //   const description = $(element).find(".description").text().trim();
//           //   links.push({
//           //     title,
//           //     link,
//           //   });
//         });
//     });

//     res.json({ links: links });
//   } catch (error) {
//     res.status(500).json({ error: "Error occurred while fetching links" });
//   }
// });
