import styles from "./page.module.css";
import HomeArticleCard from "./components/HomeArticleCard/HomeArticleCard";
import { Article } from "./utils/types/Article";
import { useEffect, useState } from "react";
import HomeArticleBody from "./components/HomeArticleCard/HomeArticleBody";

async function getExistingArticles() {
  const res = await fetch("http://localhost:3000/api/getArticles");

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("de-DE");
  const [articleList, setArticleList] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const data = await getExistingArticles();

  useEffect(() => {
    //set cookie to selectedLanguage when selectedLanguage changes
    document.cookie = `PR_selectedLanguage=${selectedLanguage}`;

    setArticleList(
      data.map((oneArticle) => {
        return {
          slug: oneArticle.slug,
          textContent: textContent.filter((targetText) => {
            targetText.articleLanguage = selectedLanguage;
          }),
        };
      })
    );
  }, [selectedLanguage]);

  return (
    <main className={styles.main}>
      <h1>Existing Articles</h1>
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
      >
        <option value="de-DE">German</option>
        <option value="en-US">English</option>
        <option value="fr-FR">French</option>
        <option value="es-ES">Spanish</option>
        <option value="it-IT">Italian</option>
        <option value="ja-JP">Japanese</option>
      </select>

      <div className={styles.articleListSectionScrollContainer}>
        <section className={styles.articleListSection}>
          {articleList
            .slice()
            .reverse()
            .map((oneArticle: Article) => (
              <HomeArticleCard
                article={oneArticle}
                selectedLanguage={selectedLanguage}
                key={oneArticle.slug}
              />
            ))}
        </section>
      </div>
      {selectedArticle && (
        <HomeArticleBody
          selectedArticle={articleList[selectedArticle]}
          selectedLanguage={selectedLanguage}
        />
      )}
    </main>
  );
}
