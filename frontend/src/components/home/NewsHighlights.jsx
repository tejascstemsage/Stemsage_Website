import { useState, useEffect } from "react";
import ViewAllButton from "../common/ViewAllButton";
import { getNews } from "../../services/newsService";
import NewsCard from "../../components/news/NewsCard";

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


/* -----------------------------------------------------------------------
   Section — News & Highlights (Home page - shows first 3 only)
------------------------------------------------------------------------ */
function NewsHighlights() {
    const LIMIT = 3;
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function loadNews() {
            try {
                setLoading(true);
                const apiNews = await getNews(LIMIT);
                if (!cancelled) {
                    if (apiNews && apiNews.length > 0) {
                        const mapped = apiNews.map(mapApiNews);
                        setNews(mapped);
                    } else {
                        // API succeeded but returned empty - hide section (empty state)
                        setNews([]);
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch news, using fallback:", err.message);
                if (!cancelled) {
                    setError(true);
                    setNews(fallbackNews.slice(0, LIMIT));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadNews();
        return () => { cancelled = true; };
    }, []);

    // Hide section entirely on empty state (no news and no error)
    if (!loading && !error && news.length === 0) {
        return null;
    }

    const newsItemsToShow = error ? fallbackNews.slice(0, LIMIT) : news;

    return (
        <section
            id="news-highlights"
            className="relative w-full overflow-hidden bg-[#f7f8fc] py-16 sm:py-24 px-5 sm:px-8 border-b border-slate-100"
        >
            {/* Subtle decorative blobs */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-red-100/40 blur-3xl"
            />

            <div className="relative mx-auto max-w-6xl">
                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        News & <span className="text-red-600">Highlights</span>
                    </h2>
                    <div className="mt-4 mx-auto h-[3px] w-20 bg-red-600 rounded-full" />
                    <p className="mt-5 max-w-xl mx-auto text-sm sm:text-base font-medium text-slate-500 leading-relaxed">
                        Explore our latest breakthroughs, milestones, and moments shaping
                        the future of learning.
                    </p>
                </div>

                {/* Cards Grid - same gap and max-width as Services/Products */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <article className="group h-full flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="relative aspect-[16/10] w-full bg-slate-100 shrink-0" />
                                    <div className="h-px bg-slate-100" />
                                    <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
                                        <div className="h-8 bg-slate-200 rounded w-3/4" />
                                        <div className="h-4 bg-slate-200 rounded w-full mt-2" />
                                        <div className="h-4 bg-slate-200 rounded w-2/3 mt-2" />
                                        <div className="mt-auto pt-4 h-10 bg-slate-200 rounded-lg w-1/3" />
                                    </div>
                                </article>
                            </div>
                        ))
                    ) : (
                        newsItemsToShow.map((item) => (
                            <NewsCard key={item.id} item={item} />
                        ))
                    )}
                </div>

                {/* View All News button - using shared component */}
                {!loading && <ViewAllButton label="View All News" to="/news" />}
            </div>
        </section>
    );
}

export default NewsHighlights;