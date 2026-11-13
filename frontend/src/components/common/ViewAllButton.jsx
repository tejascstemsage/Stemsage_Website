import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* -----------------------------------------------------------------------
   Shared "View All" button - red outlined pill style
------------------------------------------------------------------------ */
export function ViewAllButton({ label, to }) {
    return (
        <div className="mt-12 flex justify-center">
            <Link
                to={to}
                className="inline-flex items-center gap-3 rounded-full border-2 border-red-600 bg-white px-10 py-4 text-sm font-bold text-red-600 shadow-sm transition-all duration-300 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 hover:scale-105"
            >
                {label}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

export default ViewAllButton;