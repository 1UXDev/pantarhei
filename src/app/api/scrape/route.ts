import TestModels from "@/app/utils/db/models/TestModels";
import dbConnect from "@/app/utils/db/dbConnect";

export async function GET(request: Request) {
  await dbConnect();
  try {
    const test = await TestModels.find({});
    console.log("triggered", test);

    return new Response(JSON.stringify(test), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
