import * as deepl from "deepl-node";

interface RouteParams {
  language: deepl.TargetLanguageCode;
  articleSlug: string;
}

// For future improvement:
// To reduce API calls, we should cache the translated articles for a certain period of time
// or store in Mongo...

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  if (!process.env.DEEPL_API_KEY || !process.env.BASE_URL) {
    return new Response("Environment variables not set", { status: 500 });
  }
  const { language, articleSlug } = params;

  console.log(
    "parameters from article with translation",
    language,
    articleSlug
  );

  // Scraping the article from the website, via api route
  try {
    const articleResponse = await fetch(
      `${process.env.BASE_URL}/api/scrape/${articleSlug}`
    );
    if (!articleResponse.ok) {
      throw new Error(`Failed to fetch article: ${articleResponse.statusText}`);
    }

    // Translate the article
    const articleText = await articleResponse.json();
    console.log("articleText", articleText);

    const articleAsArray = [
      articleText.article[0].title,
      articleText.article[0].articleDescription,
      articleText.article[0].imageDescription,
      articleText.article[0].imageCaption,
      articleText.article[0].textContent,
    ];

    const articleImage = articleText.article[0].image;

    const woerterBuch = articleText.woerterBuch.map(
      (entry: {
        woerterBuchEintragTitel: string;
        woerterBuchEintragDescription: string;
      }) => {
        return `${entry.woerterBuchEintragTitel}: ${entry.woerterBuchEintragDescription}`;
      }
    );

    const translator = new deepl.Translator(process.env.DEEPL_API_KEY);
    const translatedArticle = await translator.translateText(
      articleAsArray,
      null,
      language
    );

    const rebuiltTranslatedArticle = {
      title: translatedArticle[0],
      articleDescription: translatedArticle[1],
      imageDescription: translatedArticle[2],
      imageCaption: translatedArticle[3],
      textContent: translatedArticle[4],
      articleImage,
    };

    const translatedWoertbuch = await translator.translateText(
      woerterBuch,
      null,
      language
    );

    return new Response(
      JSON.stringify({ rebuiltTranslatedArticle, translatedWoertbuch }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Error processing request", { status: 500 });
  }
}
