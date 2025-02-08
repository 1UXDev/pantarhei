export type ArticleType = {
  _id: string;
  slug: string;
  image: string;
  textContent: {
    articleTeaser: {
      title: string;
      imageDescription: string;
      articleDescription: string;
    };
    articleContent: {
      title: string;
      imageCaption: string;
      textContent: string;
      dict: DictType[];
    };
    articleLanguage: string;
    _id: string;
  }[];
  createdAt: string;
  __v: number;
};

export type DictType = {
  oneDictTitle: string;
  oneDictDescription: string;
  _id: string;
};
