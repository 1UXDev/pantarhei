import HeroArea from "./components/HeroArea/HeroArea";
import styles from "./page.module.css";

export async function getServerData() {
  const language = "de-DE";

  const articles = await fetch(
    `${process.env.BASE_URL}/api/getAllArticlesInLang/${language}`
  ).then((res) => res.json());

  return {
    articles,
    selectedLanguage: language,
  };
}

export default async function Home() {
  const { articles, selectedLanguage } = await getServerData();

  return (
    <main className={styles.main}>
      <h1>Existing Articles</h1>
      <HeroArea articles={articles} selectedLanguage={selectedLanguage} />
    </main>
  );
}
