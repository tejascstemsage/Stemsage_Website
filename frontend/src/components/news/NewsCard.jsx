import { useState } from "react";
import { Tag, Calendar, ArrowRight } from "lucide-react";

/* -----------------------------------------------------------------------
   Single news card - shared between Home highlights and News page
   Card shell matches Services card: rounded-xl, border-slate-200, shadow-sm,
   hover:shadow-lg hover:border-red-200 hover:-translate-y-0.5
------------------------------------------------------------------------ */
function NewsCard({ item }) {
    const [imgError, setImgError] = useState(false);

    return (
        <article
            className="group h-full flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:border-red-200 hover:-translate-y-0.5"
            aria-label={item.title}
        >
            {/* Thumbnail - fixed aspect ratio [16/10] to match Services */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 shrink-0">
                {!imgError ? (
                    <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 text-xs font-semibold">
                        Image unavailable
                    </div>
                )}

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Tag chip */}
                <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm">
                    <Tag className="h-3 w-3 text-red-600" />
                    {item.tag}
                </span>

                {/* Date */}
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                </span>
            </div>

            {/* Divider - matches Services card */}
            <div className="h-px bg-slate-100" />

            {/* Text content - matches Services card padding (px-5 pt-4 pb-5) */}
            <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight line-clamp-3 group-hover:text-red-600 transition-colors duration-300">
                    {item.title}
                </h3>

                <div className="mt-auto pt-4">
                    <a
                        href={item.link}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-2.5 px-4 transition-all duration-300 shadow hover:shadow-md hover:scale-[1.02]"
                        aria-label={"Read more about: " + item.title}
                    >
                        Read More
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </article>
    );
}

export default NewsCard;