import dbConnect from "@/app/utils/db/dbConnect";
import Articles from "@/app/utils/db/models/Articles";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const allArticlesFromDB = await Articles.find();

    return new Response(JSON.stringify(allArticlesFromDB), {
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
