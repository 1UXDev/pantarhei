import { Article } from "@/app/utils/types/Article";
import Image from "next/image";
import styles from "./HomeArticleBody.module.css";

export default function HomeArticleBody({
  selectedArticle,
  selectedLanguage,
}: {
  selectedArticle: Article;
  selectedLanguage: string;
}) {
  let [articleImage, articleTeaser, articleContent] =
    selectedArticle.textContent.find((articleInLang) => {
      return articleInLang.articleLanguage === selectedLanguage;
    });

  if (!articleContent) {
    return (
      <section className={styles.articleSection}>
        <h2>Article not found in language!</h2>
        <p>Retrieve it?</p>
        <button onClick={() => handleTranslationRequest}>
          Translate Article
        </button>
      </section>
    );
  }

  function handleTranslationRequest() {
    fetch(`/api/translateArticle/${selectedArticle.slug}/${selectedLanguage}`)
      .then((res) => {
        res.json();
      })
      .then((data) => {
        // update the data
      });
  }

  return (
    <section className={styles.articleSection}>
      <article>
        <Image
          src={articleImage}
          alt={articleTeaser.imageDescription}
          width={1920}
          height={1080}
        />
        <figcaption>{articleContent.imageCaption}</figcaption>
        <div className={styles.textContainer}>
          <h1>{articleContent.title}</h1>
          <p>{articleTeaser.articleDescription}</p>

          <p>{articleContent.textContent}</p>
        </div>
      </article>
      <article>
        <div className={styles.woerterBuchContainer}>
          <h2>Dictionary</h2>
          <ul>
            {articleContent.dict.map((entry) => (
              <li key={entry.woerterBuchEintragTitel}>
                <h3>{entry.woerterBuchEintragTitel}</h3>
                <p>{entry.woerterBuchEintragDescription}</p>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}
