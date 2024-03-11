import Image from "next/image";
import Link from "next/link";

type Article = {
  slug: string;
  title: string;
  articleDescription: string;
  image: string;
  imageDescription: string;
};

// Correctly typed function parameter
export default function HomeArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.slug}`}>
      <article>
        <h2>{article.title}</h2>
        <p>{article.articleDescription}</p>
        <Image
          src={article.image}
          alt={article.imageDescription}
          width={300}
          height={300}
        />
      </article>
    </Link>
  );
}
