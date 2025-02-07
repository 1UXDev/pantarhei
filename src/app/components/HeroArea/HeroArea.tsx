"use client";
import HomeArticleCard from "@/app/components/HomeArticleCard/HomeArticleCard";
import styles from "./HeroArea.module.css";
import { Article } from "@/app/utils/types/Article";
import HomeArticleBody from "@/app/components/HomeArticleCard/HomeArticleBody";

export default function HeroArea({ articles, selectedLanguage }) {
  if (!articles) {
    return "loaddingg ...";
  }

  return (
    <section>
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
        <option value="en-GB">English</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="it">Italian</option>
      </select>

      <div className={styles.articleListSectionScrollContainer}>
        <section className={styles.articleListSection}>
          {articles.map((article) => {
            return <HomeArticleCard key={article.slug} article={article} />;
          })}
        </section>
      </div>
      {/* {selectedArticle && (
        <HomeArticleBody
          selectedArticle={articleList[selectedArticle]}
          selectedLanguage={selectedLanguage}
        />
      )} */}
    </section>
  );
}
