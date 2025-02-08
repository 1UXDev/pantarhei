import mongoose, { Schema } from "mongoose";

const ArticlesSchema = new Schema({
  articleImage: String,
  slug: String,
  textContent: [
    {
      articleLanguage: String,
      articleTeaser: {
        title: String,
        imageDescription: String,
        articleDescription: String,
      },
      articleContent: {
        title: String,
        imageCaption: String,
        textContent: String,
        dict: [
          {
            oneDictTitle: String,
            oneDictDescription: String,
          },
        ],
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Articles ||
  mongoose.model("Articles", ArticlesSchema);
