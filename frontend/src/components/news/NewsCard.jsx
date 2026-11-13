import { useState } from "react";
import { Tag, Calendar, ArrowRight } from "lucide-react";

/* -----------------------------------------------------------------------
   Single news card - shared between Home highlights and News page
------------------------------------------------------------------------ */
function NewsCard({ item }) {
    const [imgError, setImgError] = useState(false);

    return (
        <article
            className="group relative h-full flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            aria-label={item.title}
        >
            {/* Thumbnail - fixed aspect ratio */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200 shrink-0">
                {!imgError ? (
                    <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400 text-xs font-semibold">
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

            {/* Text content */}
            <div className="flex-1 flex flex-col p-5">
                <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug line-clamp-3 group-hover:text-red-600 transition-colors duration-300">
                    {item.title}
                </h3>

                <div className="mt-auto pt-4">
                    <a
                        href={item.link}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors duration-200"
                        aria-label={"Read more about: " + item.title}
                    >
                        Read More
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </a>
                </div>
            </div>
        </article>
    );
}

export default NewsCard;