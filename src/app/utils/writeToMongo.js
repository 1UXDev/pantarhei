require("dotenv").config();
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error(
    "MongoDB URI is not defined. Check your .env file or environment variables."
  );
  process.exit(1);
}

const databaseName = "pantarhei";

async function connectToMongoDB(uri) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  return client;
}

async function insertDataIntoMongoDB(client, databaseName, jsonData) {
  const db = client.db(databaseName);
  const collection = db.collection("words");

  // Flatten the jsonData into a single array of entries
  const entries = Object.values(jsonData).flat();

  try {
    await collection.insertMany(entries);
    console.log("Data inserted into the 'words' collection");
  } catch (error) {
    console.error("Error inserting data into the 'words' collection:", error);
  }
}

async function main() {
  const filePath = path.join(__dirname, "/../../../.dictionary.json");
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const client = await connectToMongoDB(uri);

  try {
    await insertDataIntoMongoDB(client, databaseName, jsonData);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
