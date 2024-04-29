import Image from "next/image";
import Link from "next/link";
import { Article } from "@/utils/types/Article";
import { useEffect, useState } from "react";

export default function HomeArticleCard({
  article,
  selectedLanguage,
}: {
  article: Article;
  selectedLanguage: string;
}) {
  const [articleInLanguage, setArticleInLanguage] = useState({});
  const [title, imageDescription, articleDescription] =
    articleInLanguage?.articleTeaser;

  useEffect(() => {
    setArticleInLanguage(
      article.textContent.find(
        (textContent) => textContent.articleLanguage === selectedLanguage
      )
    );
  }, selectedLanguage);

  return (
    <Link href={`/article/${article.slug}/`}>
      <article>
        <Image
          src={article.articleImage}
          alt={imageDescription}
          width={300}
          height={300}
        />
        <h2>{title}</h2>
        <p>{articleDescription}</p>
      </article>
    </Link>
  );
}
