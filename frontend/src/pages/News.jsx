import { useState, useEffect } from "react";
import Footer from "../components/common/Footer";
import NewsCard from "../components/news/NewsCard";
import { getNews } from "../services/newsService";

/* -----------------------------------------------------------------------
   FALLBACK NEWS DATA (used when API fails)
------------------------------------------------------------------------ */
const fallbackNews = [
    {
        id: "news-1",
        tag: "Teacher Training",
        date: "7 Apr, 2026",
        title: "UCOST launches 6-day AI & Robotics mentor training in Uttarakhand",
        image: "/images/hero-2.png",
        link: "/courses",
    },
    {
        id: "news-2",
        tag: "Student Projects",
        date: "27 Dec, 2025",
        title: "From a Class 9 science fair model to Gujarat State's Best Startup Project…",
        image: "/images/hero-1.png",
        link: "/courses",
    },
    {
        id: "news-3",
        tag: "Impact Programs",
        date: "23 Dec, 2025",
        title: "How AI Education is Reaching Remote Schools Where Vehicles Cannot!",
        image: "/images/hero-3.png",
        link: "/courses",
    },
    {
        id: "news-4",
        tag: "Bootcamp",
        date: "15 Nov, 2025",
        title: "500 students explore Drone Technology at STEMSAGE National Bootcamp",
        image: "/images/hero-2.png",
        link: "/courses",
    },
    {
        id: "news-5",
        tag: "Lab Setup",
        date: "10 Oct, 2025",
        title: "STEMSAGE sets up state-of-the-art Robotics Lab at DPS Jaipur",
        image: "/images/hero-1.png",
        link: "/courses",
    },
    {
        id: "news-6",
        tag: "Competition",
        date: "5 Sep, 2025",
        title: "STEMSAGE students win Gold at National Science Olympiad 2025",
        image: "/images/hero-3.png",
        link: "/courses",
    },
];

/* Map API news item to component shape */
function mapApiNews(apiNews, index) {
    return {
        id: String(apiNews._id || index),
        tag: apiNews.tag || "News",
        date: apiNews.date || new Date(apiNews.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        title: apiNews.title,
        image: apiNews.image,
        link: apiNews.link || "/courses",
    };
}

function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false); // eslint-disable-line no-unused-vars

    useEffect(() => {
        let cancelled = false;
        async function loadNews() {
            try {
                setLoading(true);
                const apiNews = await getNews();
                if (!cancelled) {
                    if (apiNews && apiNews.length > 0) {
                        const mapped = apiNews.map(mapApiNews);
                        setNews(mapped);
                    } else {
                        // API succeeded but returned empty
                        setNews([]);
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch news, using fallback:", err.message);
                if (!cancelled) {
                    setError(true);
                    setNews(fallbackNews);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadNews();
        return () => { cancelled = true; };
    }, []);

    return (
        <main className="w-full bg-white font-sans text-slate-800 min-h-screen">
            {/* ─── Page Hero ─── */}
            <section className="pt-12 pb-8 px-4 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal text-slate-900 tracking-tight inline-block border-b-2 border-slate-900 pb-1">
                    News & Highlights
                </h1>
            </section>

            {/* ─── News Grid ─── */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {loading ? (
                        Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <article className="group relative h-full flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100">
                                    <div className="relative aspect-[16/10] w-full bg-slate-200 shrink-0" />
                                    <div className="flex-1 flex flex-col p-5">
                                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-slate-200 rounded w-full" />
                                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                                        <div className="mt-auto pt-4">
                                            <div className="h-6 bg-slate-200 rounded w-1/4" />
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))
                    ) : news.length === 0 ? (
                        <div className="col-span-full text-center py-16 text-slate-500 font-medium">
                            Nothing here yet
                        </div>
                    ) : (
                        news.map((item) => (
                            <NewsCard key={item.id} item={item} />
                        ))
                    )}
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </main>
    );
}

export default News;