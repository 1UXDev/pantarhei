const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get("/api/scrape", async (req, res) => {
    try {
      const response = await axios.get(
        "https://www.nachrichtenleicht.de/junge-alternative-104.html"
      );
      const html = response.data;
      const $ = cheerio.load(html);
      // extract data with cheerio
      res.json({ data: "Extracted Data" });
    } catch (error) {
      res.status(500).json({ error: "Error message" });
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
