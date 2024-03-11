import mongoose, { Schema } from "mongoose";

const TranslatedArticlesSchema = new Schema({
  title: String,
  articleDescription: String,
  image: String,
  imageDescription: String,
  slug: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TranslatedArticles ||
  mongoose.model("TranslatedArticles", TranslatedArticlesSchema);
