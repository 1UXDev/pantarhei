"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { set } from "mongoose";

export default function Home() {
  const [article, setArticle] = useState("");
  const [language, setLanguage] = useState("select");
  const [translatedArticle, setTranslatedArticle] = useState({});
  const [translatedWoerterbuch, setTranslatedWoerterbuch] = useState([]);
  const [articleList, setArticleList] = useState([]);

  function handleSubmit(e: any) {
    e.preventDefault();

    fetchArticle();
    e.target.reset();
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
    fetchArticleList();
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
          {articleList.articleList ? (
            articleList.articleList.map((oneArticle, index) => (
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
