require("dotenv").config();

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// MongoDB URI and database name
//const uri = process.env.MONGODB_URI;
const uri = process.env.MONGODB_URI;

// !!!!!!!!!!!!!!!!!!!!
// process.env did not work here yet, even though dotenv is required... weird, but the script works perfectly if you just put the URI here
// !!!!!!!!!!!!!!!!!!!!

if (!uri) {
  console.log(uri);
  console.error(
    "MongoDB URI is not defined. Check your .env file or environment variables."
  );
  process.exit(1); // Exit the process if the URI is not defined
}

// Proceed with connecting to MongoDB using the URI
const databaseName = "pantarhei";

// Function to connect to MongoDB
async function connectToMongoDB(uri) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  return client;
}

// Function to insert data into MongoDB
async function insertDataIntoMongoDB(client, databaseName, jsonData) {
  const db = client.db(databaseName);

  for (const indexKey in jsonData) {
    const collectionName = `words_${indexKey}`;
    const collection = db.collection(collectionName);

    try {
      // Insert data into the collection
      await collection.insertMany(jsonData[indexKey]);
      console.log(`Data inserted into collection: ${collectionName}`);
    } catch (error) {
      console.error(
        `Error inserting data into collection ${collectionName}:`,
        error
      );
    }
  }
}

// Main function
async function main() {
  const filePath = path.join(__dirname, "/../../../dictionary.json");
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const client = await connectToMongoDB(uri);

  try {
    await insertDataIntoMongoDB(client, databaseName, jsonData);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
