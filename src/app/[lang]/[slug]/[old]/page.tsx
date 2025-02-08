import Link from "next/link";
import Image from "next/image";
import styles from "../page.module.css";

// Types
import { ArticleType, DictType } from "@/app/utils/types/Article";
import { TargetLanguageCode } from "deepl-node";
import { languages } from "@/app/utils/languages";

export async function generateStaticParams() {
  const articles = await fetch(`${process.env.BASE_URL}/api/getArticle`).then(
    (res) => res.json()
  );

  const params = articles.flatMap((article: ArticleType) =>
    languages.map((lang) => ({
      slug: article.slug,
      lang: lang,
    }))
  );

  return params;
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string; lang: TargetLanguageCode };
}) {
  const { slug, lang } = await params;

  const articleContent = await fetch(
    `${process.env.BASE_URL}/api/getArticle/${slug}/${lang}`
  ).then((res) => res.json());

  if (articleContent.error || !articleContent) {
    return <p>Article not found</p>;
  }

  return (
    <main>
      <div className={styles.backButton}>
        <Link href="/">← Back to Articles</Link>
      </div>
      {articleContent ? (
        <section className={styles.articleSection}>
          <article>
            {articleContent.image ? (
              <div className="relative h-96 w-full">
                <Image
                  src={articleContent.image}
                  alt={articleContent.imageDescription}
                  width={1920} // Set the width of the image
                  height={1080} // Set the height of the image
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-96 w-full" />
            )}
            <figcaption>{articleContent.imageCaption}</figcaption>
            <div className={styles.textContainer}>
              <h1>{articleContent.title}</h1>
              <p>{articleContent.articleDescription}</p>

              <p>{articleContent.articleContent.textContent}</p>
            </div>
          </article>
          <article>
            <div className={styles.woerterBuchContainer}>
              <h2>Dictionary</h2>
              <ul>
                {articleContent.articleContent.dict.map((entry: DictType) => (
                  <li key={entry.oneDictTitle}>
                    <h3>{entry.oneDictTitle}</h3>
                    <p>{entry.oneDictDescription}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}
