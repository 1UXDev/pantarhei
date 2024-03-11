import styles from "./page.module.css";
import HomeArticleCard from "./components/HomeArticleCard/HomeArticleCard";

type Article = {
  slug: string;
  title: string;
  articleDescription: string;
  image: string;
  imageDescription: string;
  articleContent: {
    imageCaption: string;
    textContent: string;
    woertebuch: [
      {
        woerterBuchEintragTitel: string;
        woerterBuchEintragDescription: string;
      }
    ];
  };
};

async function getExistingArticles() {
  const res = await fetch("http://localhost:3000/api/loadExistingArticles");

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Home() {
  const articlesExistingInDB = await getExistingArticles();

  return (
    <main className={styles.main}>
      <h1>Existing Articles</h1>
      <div className={styles.articleListSectionScrollContainer}>
        <section className={styles.articleListSection}>
          {articlesExistingInDB &&
            articlesExistingInDB.map((oneArticle: Article) => (
              <HomeArticleCard article={oneArticle} key={oneArticle.slug} />
            ))}
        </section>
      </div>
    </main>
  );
}
