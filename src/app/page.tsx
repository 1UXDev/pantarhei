import styles from "./page.module.css";
import HomeArticleCard from "./components/HomeArticleCard/HomeArticleCard";
import { Article } from "./utils/types/Article";
import HomeArticleBody from "./components/HomeArticleCard/HomeArticleBody";

async function fetchArticles(language) {
  const res = await fetch(`/api/getArticles?lang=${language}`);
  if (!res.ok) {
    throw new Error("Failed to fetch articles");
  }
  return res.json();
}

export async function getServerData({ params, query }) {
  // Fetch articles based on the language from the query params or default to 'de-DE'
  const language = query.lang || "de-DE";
  const articles = await fetchArticles(language);
  console.log("articles", articles);
  return {
    props: { articles, selectedLanguage: language }, // Pass articles and the selected language as props
  };
}

export default async function Home({ articles, selectedLanguage }) {
  console.log("articles", articles);
  return (
    <main className={styles.main}>
      <h1>Existing Articles</h1>
      <select
        value={selectedLanguage}
        onChange={(e) => {
          // add language parameter
          const url = new URL(window.location);
          url.searchParams.set("lang", e.target.value);
          window.location.href = url.toString();
        }}
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
          {articles
            .slice()
            .reverse()
            .map((article) => {
              const articleInLanguage =
                article.textContent.find(
                  (textContent) =>
                    textContent.articleLanguage === selectedLanguage
                ) || {};

              return (
                <HomeArticleCard
                  key={article.slug}
                  article={article}
                  title={articleInLanguage.title}
                  imageDescription={articleInLanguage.imageDescription}
                  articleDescription={articleInLanguage.articleDescription}
                />
              );
            })}
        </section>
      </div>
      {/* {selectedArticle && (
        <HomeArticleBody
          selectedArticle={articleList[selectedArticle]}
          selectedLanguage={selectedLanguage}
        />
      )} */}
    </main>
  );
}
