import Image from "next/image";
import Link from "next/link";

export default function HomeArticleCard({
  article,
  title,
  imageDescription,
  articleDescription,
}) {
  return (
    <Link href={`/article/${article.slug}/`}>
      <article>
        <Image
          src={article.articleImage}
          alt={imageDescription || "Article Image"}
          width={300}
          height={300}
          unoptimized // You may need this if you are not using a supported CDN
        />
        <h2>{title}</h2>
        <p>{articleDescription}</p>
      </article>
    </Link>
  );
}
