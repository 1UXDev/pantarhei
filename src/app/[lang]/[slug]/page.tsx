import Link from "next/link";
import Image from "next/image";
import { ArticleType, DictType } from "@/app/utils/types/Article";
import { languages } from "@/app/utils/languages";

// export async function generateStaticParams() {

//   const articles = await fetch(`${baseUrl}/api/getArticle`).then((res) =>
//     res.json()
//   );

//   const params = articles.flatMap((article: ArticleType) =>
//     languages.map((lang) => ({
//       slug: article.slug,
//       lang: lang,
//     }))
//   );

//   return params;
// }

export default async function ArticlePage({
  params,
}: {
  params: { slug: string; lang: string };
}) {
  const { slug, lang } = params;

  console.log(slug, lang);

  const article = await fetch(
    `${process.env.BASE_URL}/api/getArticle/${slug}/${lang}`
  ).then((res) => res.json());

  console.log(article);

  if (article.error || !article.textContent[0]) {
    return <p>Article not found</p>;
  }

  const articleContent = article.textContent[0].articleContent;

  return (
    <main className="bg-bg min-h-screen mb-24">
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

              <div className="absolute p-8 inset-0 bg-gradient-to-t from-black/80 z-10 flex flex-col justify-end container-c">
                <div className="text-white/80">
                  <Link href={`/${lang}`}>← Back to Dashboard</Link>
                </div>
                <h1 className="text-4xl text-white">{articleContent.title}</h1>
                <figcaption className="text-white/80">
                  {articleContent.imageCaption}
                </figcaption>
              </div>
            </div>

            <div className="my-8 px-8">
              <p>{articleContent.textContent}</p>
            </div>
          </article>

          <hr className="border-t border-primary w-1/2 mx-auto my-8" />

          <article>
            <div className="px-8">
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {articleContent.dict.map((entry: DictType) => (
                  <li key={entry.oneDictTitle} className="my-2">
                    <h3 className="font-bold">{entry.oneDictTitle}</h3>
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
