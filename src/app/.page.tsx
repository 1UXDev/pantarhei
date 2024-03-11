"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

export default function OldHome() {
  // get the articles
  const [articlesExistingInDB, setArticlesExistingInDB] = useState();
  const [newArticlesToHydrate, setNewArticlesToHydrate] = useState();

  // select an Article and a Language to translate
  const [language, setLanguage] = useState("select");
  const [selectedArticle, setSelectedArticle] = useState();

  // response from Backend(API or DB, depending wether exists already in DB)
  const [translatedArticle, setTranslatedArticle] = useState({});
  const [translatedWoerterbuch, setTranslatedWoerterbuch] = useState([]);

  // word translations
  const [wordToTranslate, setWordToTranslate] = useState("");
  const [translatedWordList, setTranslatedWordList] = useState([]);

  function handleSubmit(e: any) {
    e.preventDefault();

    fetchArticle();
    e.target.reset();
  }

  async function fetchArticlesExistingInDB() {
    try {
      await fetch("api/loadExistingArticles")
        .then((res) => res.json())
        .then((data) => setArticlesExistingInDB(data))
        .then((data) =>
          console.log("data of initial fetch from articles in DB", data)
        );
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchNewArticlesToHydrate() {
    // get the latest articles that are NOT in the DB yet from scraping the news-sites
    await fetch("api/scrape")
      .then((res) => res.json())
      .then((data) => setNewArticlesToHydrate(data))
      .then((data) =>
        console.log("fetched & scraped data for hydration", data)
      );
  }

  async function fetchArticle() {
    if (language === "select" || !article) {
      return alert("Please select a language & an article");
    }
    try {
      const response = await fetch(`/api/scrape/${article}/${language}`);
      const data = await response.json();
      setTranslatedArticle(data.rebuiltTranslatedArticle);
      setTranslatedWoerterbuch(data.translatedWoerterbuch);
      console.log(data);
    } catch (error) {
      console.error("Error fetching article:", error);
    }
  }

  async function fetchArticleList() {
    const fetchedArticles = await fetch("/api/scrape");
    const data = await fetchedArticles.json();
    setArticleList(data);
    console.log(data);
  }

  useEffect(() => {
    fetchArticlesExistingInDB();
    fetchNewArticlesToHydrate();
  }, []);

  useEffect(() => {
    console.log(translatedArticle);
  }, [translatedArticle]);

  useEffect(() => {
    console.log(article);
    console.log(language);
  }, [article, language]);

  return (
    <main className={styles.main}>
      <div className={styles.articleListSectionScrollContainer}>
        <section className={styles.articleListSection}>
          {articlesExistingInDB ? (
            articlesExistingInDB.map((oneArticle, index) => (
              <article
                key={index}
                onClick={() => setArticle(oneArticle.slug)}
                className={`${
                  oneArticle.slug === article ? styles.selected : null
                }`}
              >
                <img src={oneArticle.image} alt={oneArticle.imageDescription} />
                <h2>{oneArticle.title}</h2>
                <p>{oneArticle.articleDescription}</p>
              </article>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </section>
      </div>

      <section>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            placeholder="put the articles url here"
            onChange={(e) => setArticle(e.target.value)}
          ></input>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="select">Select Language</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="fr">French</option>
            <option value="it">Italian</option>
            <option value="nl">Dutch</option>
            <option value="pl">Polish</option>
            <option value="pt">Portuguese</option>
          </select>
          <button type="submit">get Article</button>
        </form>
      </section>
      <section className={styles.translatedArticle}>
        {translatedArticle.title ? (
          <article>
            <h1>{translatedArticle.title.text}</h1>
            <img src={translatedArticle.articleImage} alt="article image" />
            <span> {translatedArticle.imageCaption.text}</span>
            <p>{translatedArticle.textContent.text}</p>
          </article>
        ) : (
          <p>Select an Article & a Language to Start</p>
        )}
      </section>
    </main>
  );
}
