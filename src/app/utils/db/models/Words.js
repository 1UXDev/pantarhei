import mongoose from "mongoose";

const WordsSchema = new mongoose.Schema({
  indexKey: String,
  spanish: {
    word: String,
    gender: String,
    additionalInfo: String,
  },
  german: {
    word: String,
    gender: String,
    additionalInfo: String,
  },
  meanings: [
    {
      wordType: String,
      moreInfo: String,
    },
  ],
});

export default mongoose.models.Words || mongoose.model("Words", WordsSchema);
