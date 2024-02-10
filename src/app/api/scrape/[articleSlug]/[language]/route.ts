import * as deepl from "deepl-node";

interface RouteParams {
  language: deepl.TargetLanguageCode;
  articleSlug: string;
}

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  if (!process.env.DEEPL_API_KEY || !process.env.BASE_URL) {
    return new Response("Environment variables not set", { status: 500 });
  }
  const { language, articleSlug } = params;

  try {
    const articleResponse = await fetch(
      `${process.env.BASE_URL}/api/scrape/${articleSlug}`
    );
    if (!articleResponse.ok) {
      throw new Error(`Failed to fetch article: ${articleResponse.statusText}`);
    }

    const articleText = await articleResponse.text();

    const translator = new deepl.Translator(process.env.DEEPL_API_KEY);
    const translatedArticle = await translator.translateText(
      articleText,
      null,
      language
    );

    return new Response(JSON.stringify({ translatedArticle }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Error processing request", { status: 500 });
  }
}
