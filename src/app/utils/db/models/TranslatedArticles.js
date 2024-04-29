import mongoose, { Schema } from "mongoose";
import Articles from "./Articles";

const TranslatedArticlesSchema = new Schema({
  originalArticleId: { type: Schema.Types.ObjectId, ref: "Articles" },
  articleLanguage: String,
  translatedArticleInLanguage: {
    title: String,
    articleDescription: String,
    image: String,
    imageDescription: String,
    slug: String,
    articleContent: {
      imageCaption: String,
      textContent: String,
      woerterBuch: [
        {
          woerterBuchEintragTitel: String,
          woerterBuchEintragDescription: String,
        },
      ],
    },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TranslatedArticles ||
  mongoose.model("TranslatedArticles", TranslatedArticlesSchema);
