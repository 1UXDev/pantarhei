"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function ArticlePage() {
  const slug = usePathname().split("/").pop();
  const [dataToUse, setDataToUse] = useState(null);
  const [articleContent, setArticleContent] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("de-DE");

  useEffect(() => {
    console.log("Slug:", slug);

    if (slug) {
      console.log("Fetching article content...");

      fetch(`/api/loadExistingArticles/${slug}/${selectedLanguage}`)
        .then((res) => res.json())
        .then((data) => {
          setDataToUse(data);
          console.log(data);

          setArticleContent(
            data.translatedArticle?.find(
              (article) => article.articleLanguage === selectedLanguage
            ) || dataToUse
          );
        })
        .catch((error) => console.error("Error:", error));
    }
  }, [slug, selectedLanguage]);

  return (
    <main>
      <div className={styles.backButton}>
        <Link href="/">← Back to Articles</Link>
      </div>
      {articleContent ? (
        <section className={styles.articleSection}>
          <article>
            <Image
              src={articleContent.image}
              alt={articleContent.imageDescription}
              width={1920} // Set the width of the image
              height={1080} // Set the height of the image
            />
            <figcaption>{articleContent.imageCaption}</figcaption>
            <div className={styles.textContainer}>
              <h1>{articleContent.title}</h1>
              <p>{articleContent.articleDescription}</p>

              <p>{articleContent.articleContent.textContent}</p>
            </div>
          </article>
          <article>
            <div className={styles.woerterBuchContainer}>
              <h2>Wörterbuch</h2>
              <ul>
                {articleContent.articleContent.woerterBuch.map((entry) => (
                  <li key={entry.woerterBuchEintragTitel}>
                    <h3>{entry.woerterBuchEintragTitel}</h3>
                    <p>{entry.woerterBuchEintragDescription}</p>
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
