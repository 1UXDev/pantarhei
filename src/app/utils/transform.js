const fs = require("fs");
const path = require("path");

const parseWordGroup = (wordGroup) => {
  if (!wordGroup || wordGroup.trim() === "") {
    console.warn("Encountered empty or undefined word group.");
    return null;
  }

  // Updated regex to include all Spanish and German special characters
  const wordRegex =
    /([a-zA-ZáéíóúñÁÉÍÓÚÑüäößÜÄÖß\s\(\)\¿\¡\[\]\-\.\,]+)(?:\s*\{(\w+)\})?\s*(?:\[(.+)\])?/;
  const match = wordGroup.match(wordRegex);

  if (!match) {
    console.error(`No match for: ${wordGroup}`);
    return null;
  }

  return {
    word: match[1].trim(),
    ...(match[2] && { gender: match[2] }),
    ...(match[3] && { additionalInfo: match[3] }),
  };
};

const getIndexKey = (word) => {
  const naturalLetterRegex = /^[A-Za-zñóúÑÓÚ]/;
  if (naturalLetterRegex.test(word)) {
    return word.substring(0, 2).toLowerCase();
  }
  return "other";
};

const transformDictionary = (filePath) => {
  const data = fs.readFileSync(filePath, "utf-8");
  const lines = data.split("\n");

  const dictionary = {};

  lines.forEach((line) => {
    if (!line.trim()) return; // Skip empty lines

    const [spanishGroup, germanGroup, wordType, moreInfo] = line.split("\t");
    const spanish = parseWordGroup(spanishGroup);
    const german = parseWordGroup(germanGroup);

    if (!spanish || !german) {
      console.warn(`Skipping line due to parsing failure: ${line}`);
      return; // Skip this line if parsing fails
    }

    const key = spanish.word + "_" + german.word;
    const indexKey = getIndexKey(spanish.word);

    if (!dictionary[indexKey]) {
      dictionary[indexKey] = [];
    }

    dictionary[indexKey].push({
      spanish,
      german,
      meanings: [{ wordType, moreInfo }],
    });
  });

  return dictionary;
};

const filePath = path.join(__dirname, "/../../../.dict.txt");
const jsonData = transformDictionary(filePath);

const json = JSON.stringify(jsonData, null, 2);

// Define the path for the new JSON file
const outputPath = path.join(__dirname, "/../../../dictionary.json");

// Write the JSON string to the file
fs.writeFileSync(outputPath, json);
