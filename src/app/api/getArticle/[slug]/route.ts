import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug;
  const lang = "de";

  try {
    await dbConnect();
    const article = await Articles.findOne({ slug: slug });

    if (!article) {
      return new NextResponse(JSON.stringify({ error: "Article not found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const articleInLanguage = article.textContent.find(
      (articleInLanguage: Article["textContent"][number]) =>
        articleInLanguage.articleLanguage === lang
    );
    return new NextResponse(JSON.stringify(articleInLanguage), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
