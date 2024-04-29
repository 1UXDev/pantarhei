export type Article = {
  slug: string;
  textContent: [
    {
      articleLanguage: string;
      articleImage: string;
      articleTeaser: {
        title: string;
        imageDescription: string;
        articleDescription: string;
      };
      articleContent: {
        title: string;
        imageCaption: string;
        textContent: string;
        dict: [
          {
            oneDictTitle: string;
            oneDictDescription: string;
          }
        ];
      };
    }
  ];
  createdAt: string;
};
