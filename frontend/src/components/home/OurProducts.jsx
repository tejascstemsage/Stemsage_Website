import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    CheckCircle2,
    Tag,
    ShoppingCart,
    MessageCircle,
    Star,
    Zap,
    Cpu,
    FlaskConical,
    Wrench,
    GraduationCap,
} from "lucide-react";
import ViewAllButton from "../common/ViewAllButton";
import { getHomeProducts } from "../../services/productService";
import { fallbackProducts } from "../../constants/fallbackProducts";

/* -----------------------------------------------------------------------
   Price formatting helper - strip ₹ if present, then format with Indian grouping
------------------------------------------------------------------------ */
export function formatPrice(price) {
    if (!price || price === "Enquire for Price") return "Enquire for Price";
    const num = Number(String(price).replace(/[₹,\s]/g, ""));
    if (isNaN(num)) return "Enquire for Price";
    return `₹${num.toLocaleString("en-IN")}`;
}

/* Map API product to component shape */
export function mapApiProduct(apiProduct, index) {
    const iconMap = {
        Electronics: Cpu,
        Robotics: Wrench,
        IoT: Zap,
        "3D Printing": FlaskConical,
        Components: Cpu,
        Kits: GraduationCap,
        STEM: FlaskConical,
        Programming: Cpu,
        AI: Zap,
    };

    // Get raw price without ₹ prefix
    const rawPrice = apiProduct.price;

    return {
        id: String(apiProduct._id || index),
        badge: apiProduct.category || "Product",
        icon: iconMap[apiProduct.category] || Cpu,
        title: apiProduct.title || "Product",
        subtitle: apiProduct.description?.substring(0, 60) || "STEM Product",
        features: Array.isArray(apiProduct.features) && apiProduct.features.length > 0
            ? apiProduct.features.slice(0, 4)
            : [
                "High-quality components",
                "Comprehensive guides",
                "Hands-on learning",
            ],
        price: formatPrice(rawPrice),
        priceType: apiProduct.price ? "fixed" : "enquire",
        tags: Array.isArray(apiProduct.tags) && apiProduct.tags.length > 0
            ? apiProduct.tags.slice(0, 6)
            : [apiProduct.category].filter(Boolean),
        cta: apiProduct.price ? "Buy Now" : "Enquire Now",
        ctaType: apiProduct.price ? "buy" : "enquire",
        ctaLink: apiProduct.price ? "/store" : "/contact",
        featured: apiProduct.isFeatured || apiProduct.showOnHome || false,
        image: apiProduct.image,
    };
}

/* ============================================================
   PRODUCT CARD
   ============================================================ */
export function ProductCard({ product, isFirstFeatured = false }) {
    const Icon = product.icon || Cpu;
    const showBadge = !!(product.featured && isFirstFeatured);
    const features = Array.isArray(product.features) ? product.features : [];
    const tags = Array.isArray(product.tags) ? product.tags : [];

    return (
        <div
            className={`
                group relative h-full flex flex-col rounded-xl bg-white border transition-all duration-300
                hover:shadow-lg hover:border-red-200 hover:-translate-y-0.5
                ${product.featured
                    ? "border-red-200 shadow-sm ring-2 ring-red-500 ring-offset-1"
                    : "border-slate-200 shadow-sm"
                }
            `}
        >
            {/* Featured Ribbon - inside card, top edge */}
            {showBadge && (
                <div className="absolute -top-3 left-4 z-10 flex items-center gap-1 rounded-full bg-red-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow shadow-red-600/30">
                    <Star className="h-2.5 w-2.5 fill-white" />
                    Most Popular
                </div>
            )}

            {/* Image Placeholder - keep h-40 as specified */}
            <div className={`relative overflow-hidden rounded-t-xl h-40 flex items-center justify-center ${product.featured ? "bg-red-50" : "bg-slate-100"}`}>
                <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-red-600/8" />
                <div className="flex flex-col items-center gap-2 opacity-40">
                    <div className="h-10 w-10 rounded-lg bg-slate-300 flex items-center justify-center">
                        <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">Product Image</span>
                </div>
                {/* Badge top-right */}
                {product.badge && (
                <span className="absolute top-2 right-2 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
                    {product.badge}
                </span>
                )}
            </div>

            {/* Card Header */}
            <div className={`flex items-center gap-3 px-5 pt-4 pb-2.5 ${product.featured ? "bg-white" : "bg-white"}`}>
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow shadow-red-600/25 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-base font-extrabold leading-tight text-slate-900">
                        {product.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 leading-tight">
                        {product.subtitle}
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-slate-100" />

            {/* Card Body */}
            <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
                {/* Features */}
                <ul className="space-y-1.5">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                            <span className="text-sm font-medium text-slate-700 leading-snug line-clamp-2">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                        >
                            <Tag className="h-2.5 w-2.5 text-red-500" />
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Divider */}
                <div className="my-3 h-px w-full bg-slate-100" />

                {/* Price & CTA */}
                <div className="mt-auto flex items-center justify-between gap-3">
                    {/* Price */}
                    <div>
                        {product.priceType === "fixed" ? (
                            <>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Price
                                </p>
                                <p className="mt-0.5 text-xl font-black tracking-tight text-red-600">
                                    {product.price}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Pricing
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-slate-500">
                                    {product.price}
                                </p>
                            </>
                        )}
                    </div>

                    {/* CTA Button */}
                    <Link
                        to={product.ctaLink}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow shadow-red-600/20 transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-md hover:shadow-red-600/30"
                    >
                        {product.ctaType === "buy" ? (
                            <ShoppingCart className="h-4 w-4" />
                        ) : (
                            <MessageCircle className="h-4 w-4" />
                        )}
                        {product.cta}
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   MAIN SECTION
   ============================================================ */
function OurProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function loadProducts() {
            try {
                setLoading(true);
                const apiProducts = await getHomeProducts();
                if (!cancelled) {
                    if (apiProducts && apiProducts.length > 0) {
                        const mapped = apiProducts.map(mapApiProduct);
                        setProducts(mapped);
                    } else {
                        // API succeeded but returned empty - hide section (empty state)
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch products for home, using fallback:", err.message);
                if (!cancelled) {
                    setError(true);
                    setProducts(fallbackProducts);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadProducts();
        return () => { cancelled = true; };
    }, []);

    // Hide section entirely on empty state (no products and no error)
    if (!loading && !error && products.length === 0) {
        return null;
    }

    // Find first featured product index for badge display
    const firstFeaturedIndex = products.findIndex(p => p.featured);

    return (
        <section className="relative overflow-hidden bg-white py-16 sm:py-24 px-5 sm:px-8 border-b border-slate-100">
            {/* Subtle background accent */}
            <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-50 blur-3xl" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-slate-100 blur-3xl" />

            <div className="relative mx-auto max-w-6xl">
                {/* Section Header - matches Services and News style */}
                <div className="text-center">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Explore Our <span className="text-red-600">Product Range</span>
                    </h2>
                    {/* Red line under title */}
                    <div className="mt-4 mx-auto h-[3px] w-20 bg-red-600 rounded-full" />
                </div>

                {/* Product Grid - same gap and max-width as Services/News */}
                <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="group h-full flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="h-40 bg-slate-100" />
                                    <div className="h-px bg-slate-100" />
                                    <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
                                        <div className="space-y-3">
                                            <div className="h-8 bg-slate-200 rounded w-3/4" />
                                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                                        </div>
                                        <div className="mt-auto pt-4 flex gap-1">
                                            <div className="h-6 w-20 bg-slate-200 rounded-full" />
                                            <div className="h-6 w-20 bg-slate-200 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        products.slice(0, 3).map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={index}
                                isFirstFeatured={index === firstFeaturedIndex}
                            />
                        ))
                    )}
                </div>

                {/* See All Products Button - using shared component */}
                <ViewAllButton label="See All Products" to="/store" />
            </div>
        </section>
    );
}

export default OurProducts;