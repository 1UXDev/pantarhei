import Image from "next/image";
import Link from "next/link";

export default function HomeArticleCard({ article }) {
  const { title, articleDescription, imageDescription } =
    article.textContent[0].articleTeaser;

  return (
    <Link href={`/article/${article.slug}/`}>
      <article>
        <Image
          src={"https://www2.tuhh.de/zll/wp-content/uploads/placeholder.png"}
          alt={imageDescription || "Article Image"}
          width={300}
          height={300}
          unoptimized // no cdn use, investigate
        />
        <h2>{title}</h2>
        <p>{articleDescription}</p>
      </article>
    </Link>
  );
}
