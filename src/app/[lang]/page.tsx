import { MobileMenu } from "../components/UserDashboard/MobileMenu/MobileMenu";
import { languages } from "../utils/languages";
import { ArticleType } from "../utils/types/Article";
import Link from "next/link";

export async function generateStaticParams() {
  const params = languages.map((lang) => ({
    lang: lang,
  }));

  return params;
}

export default async function UserDashboard({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = await params;
  const navigation = [
    { name: "Home", href: `/${lang}` },
    { name: "All Articles", href: "#" },
    { name: "Your Memos", href: "#" },
  ];

  const articles = await fetch(
    `${process.env.BASE_URL}/api/getAllArticlesInLang/${lang}`
  ).then((res) => res.json());

  return (
    <div className="bg-white min-h-screen">
      <MobileMenu navigation={navigation} />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        {/* bg */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        {/* content */}
        <div className="mx-auto max-w-2xl py-12 sm:py-20 lg:py-32">
          {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-text ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Features coming up!{" "}
              <a href="#" className="font-semibold text-primary">
                <span aria-hidden="true" className="absolute inset-0" />
                View Roadmap <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div> */}
          <div className="text-center">
            <h1 className="text-5xl font-semibold font-serif tracking-tight text-balance text-gray-900 sm:text-7xl">
              Read more <span className="text-primary-light">.</span>
              <span className="text-primary">.</span>
              <span className="text-primary-dark">.</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-pretty text-text sm:text-xl/8">
              Learn any language on the go, with Pantarhei.{" "}
            </p>
            {/* <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get started
              </a>
              <a href="#" className="text-sm/6 font-semibold text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div> */}
          </div>
        </div>
        {/* bg */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>

      {articles && (
        <div className="grid grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-2 lg:gap-12 lg:px-8 2xl:grid-cols-3">
          {articles.map((article: ArticleType) => {
            return (
              <div key={article.slug} className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                <div className="relative z-10 p-6 bg-white rounded-lg shadow-lg">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {article.textContent[0].articleTeaser.title}
                  </h2>
                  <p className="mt-2 text-base/7 text-gray-600">
                    {article.textContent[0].articleTeaser.articleDescription}
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/de/${article.slug}`}
                      className="text-sm/6 font-semibold text-primary hover:underline"
                    >
                      Read more
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
