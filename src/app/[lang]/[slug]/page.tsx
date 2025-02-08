import Link from "next/link";
import Image from "next/image";
import { ArticleType, DictType } from "@/app/utils/types/Article";
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
  params: { slug: string; lang: string };
}) {
  const { slug, lang } = await params;

  const article = await fetch(
    `${process.env.BASE_URL}/api/getArticle/${slug}/${lang}`
  ).then((res) => res.json());

  if (article.error || !article.textContent[0]) {
    return <p>Article not found</p>;
  }

  const articleContent = article.textContent[0].articleContent;

  return (
    <main className="bg-bg min-h-screen">
      {articleContent ? (
        <section className="">
          <article>
            <div className="w-full h-96 relative bg-gradient-to-br from-primary-light to-primary-dark cnt">
              {article.image && (
                <Image
                  src={article.image}
                  alt={article.textContent[0].articleTeaser.imageDescription}
                  fill
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 z-10 flex flex-col justify-end container-c">
                <div className="text-white/80">
                  <Link href={`/${lang}`}>← Back to Dashboard</Link>
                </div>
                <h1 className="text-4xl text-white">{articleContent.title}</h1>
                <figcaption className="text-white/80">
                  {articleContent.imageCaption}
                </figcaption>
              </div>
            </div>

            <div className="">
              <p>{articleContent.articleDescription}</p>
            </div>
          </article>
          <article>
            <div className="">
              <h2>Wörterbuch</h2>
              <ul>
                {articleContent.dict.map((entry: DictType) => (
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
