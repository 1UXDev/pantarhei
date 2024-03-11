import mongoose, { Schema } from "mongoose";
import TranslatedArticles from "./TranslatedArticles";

const ArticlesSchema = new Schema({
  title: String,
  articleDescription: String,
  image: String,
  imageDescription: String,
  slug: String,
  createdAt: { type: Date, default: Date.now },
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
  translatedArticle: [
    {
      articleLanguage: String,
      translatedArticleInLanguage: [
        { articleId: { type: Schema.Types.ObjectId, ref: TranslatedArticles } },
      ],
    },
  ],
});

export default mongoose.models.Articles ||
  mongoose.model("Articles", ArticlesSchema);
