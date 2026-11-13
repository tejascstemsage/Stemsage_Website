import { Cpu, Zap, Wrench, FlaskConical, GraduationCap } from "lucide-react";

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