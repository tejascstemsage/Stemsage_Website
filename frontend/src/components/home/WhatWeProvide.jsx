import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ViewAllButton from "../common/ViewAllButton";

import workshopImg from "../../assets/workshop-img.jpg";
import eduKitImg from "../../assets/Edu-kit.webp";
import labSetupImg from "../../assets/services/Lab_Setup.png";
import { getServices } from "../../services/serviceService";

/* ============================================================
   FALLBACK SERVICES DATA (used when API fails or returns empty)
   ============================================================ */
const fallbackServices = [
    {
        id: "01",
        title: "Curriculums and Workshops",
        description: "Structured, hands-on learning programs in STEM, Robotics, Physical AI, Innovation, Aviation, and emerging technologies, designed to develop practical skills throughout the academic year.",
        image: workshopImg,
        link: "/courses",
        buttonText: "Explore Programs"
    },
    {
        id: "02",
        title: "Smart Lab Setup",
        description: "End-to-end lab setup solutions for schools and colleges, from STEM and Innovation Labs to advanced Engineering Labs, equipped with modern infrastructure, tools, and technology.",
        image: labSetupImg,
        link: "/contact",
        buttonText: "Explore Lab Solutions"
    },
    {
        id: "03",
        title: "Smart Educational Kits",
        description: "Innovative, hands-on educational kits that make STEM concepts, electronics, robotics, and emerging technologies engaging, interactive, and accessible to learners.",
        image: eduKitImg,
        link: "/store",
        buttonText: "Explore Kits"
    },
    {
        id: "04",
        title: "Industrial Training Programs",
        description: "Industry-aligned technical training in Embedded Systems, Industrial IoT, Autonomous Robotics, ROS, VLSI, Industrial Automation, Drone Technology, and Advanced Circuit Design.",
        image: null,
        link: "/contact",
        buttonText: "Explore Training Programs"
    },
    {
        id: "05",
        title: "Teacher Capacity Building",
        description: "Professional development programs in STEM, AI, Robotics, IoT, Design Thinking, and innovative teaching methodologies.",
        image: null,
        link: "/contact",
        buttonText: "Explore Programs"
    },
    {
        id: "06",
        title: "Digital Learning Ecosystem",
        description: "Self-learning platforms, tutorial videos, educational resources, and digital curriculums that support flexible, technology-driven learning.",
        image: null,
        link: "/contact",
        buttonText: "Explore Platforms"
    },
];

/* Map API service to component shape */
function mapApiService(apiService, index) {
    const linkMap = {
        "Curriculums and Workshops": "/courses",
        "Smart Lab Setup": "/contact",
        "Smart Educational Kits": "/store",
        "Industrial Training Programs": "/contact",
        "Teacher Capacity Building": "/contact",
        "Digital Learning Ecosystem": "/contact",
    };

    const buttonTextMap = {
        "Curriculums and Workshops": "Explore Programs",
        "Smart Lab Setup": "Explore Lab Solutions",
        "Smart Educational Kits": "Explore Kits",
        "Industrial Training Programs": "Explore Training Programs",
        "Teacher Capacity Building": "Explore Programs",
        "Digital Learning Ecosystem": "Explore Platforms",
    };

    return {
        id: String(apiService._id || index),
        title: apiService.title,
        description: apiService.description,
        image: apiService.image,
        link: linkMap[apiService.title] || "/services",
        buttonText: buttonTextMap[apiService.title] || "Explore",
    };
}

function CardImage({ src, alt }) {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-slate-100 text-slate-400 gap-2 opacity-40">
                <div className="h-10 w-10 rounded-lg bg-slate-300 flex items-center justify-center">
                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-[10px] font-medium text-slate-400">Service Image</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
        />
    );
}

export function ServiceCard({ item }) {
    return (
        <div className="group flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:border-red-200 hover:-translate-y-0.5">
            {/* Top Image Area - aspect-[16/10] to match News cards */}
            <div className="w-full aspect-[16/10] overflow-hidden bg-slate-100 shrink-0 relative">
                <CardImage src={item.image} alt={item.title} />
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Bottom Text Area */}
            <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
                <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight line-clamp-2">
                        {item.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-slate-600 leading-snug line-clamp-4">
                        {item.description}
                    </p>
                </div>

                {/* Button */}
                <div className="mt-auto pt-4">
                    <Link
                        to={item.link}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-2.5 px-4 transition-all duration-300 shadow hover:shadow-md hover:scale-[1.02]"
                    >
                        {item.buttonText}
                    </Link>
                </div>
            </div>
        </div>
    );
}

function WhatWeProvide() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function loadServices() {
            try {
                setLoading(true);
                const apiServices = await getServices();
                if (!cancelled) {
                    if (apiServices && apiServices.length > 0) {
                        const mapped = apiServices.map(mapApiService);
                        setServices(mapped);
                    } else {
                        // API succeeded but returned empty - hide section (empty state)
                        setServices([]);
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch services for home, using fallback:", err.message);
                if (!cancelled) {
                    setError(true);
                    setServices(fallbackServices);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadServices();
        return () => { cancelled = true; };
    }, []);

    // Hide section entirely on empty state (no services and no error)
    if (!loading && !error && services.length === 0) {
        return null;
    }

    return (
        <section className="relative overflow-hidden bg-white py-16 sm:py-24 px-5 sm:px-8 border-b border-slate-100">
            <div className="relative mx-auto max-w-6xl">
                {/* Heading - matches News and Products style */}
                <div className="text-center">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        What we <span className="text-red-600">Provide</span>
                    </h2>
                    {/* Red line under title */}
                    <div className="mt-4 mx-auto h-[3px] w-20 bg-red-600 rounded-full" />
                </div>

                {/* 3-column Grid — first 3 only */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="group flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="w-full aspect-[16/10] bg-slate-100" />
                                    <div className="h-px bg-slate-100" />
                                    <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
                                        <div className="space-y-3">
                                            <div className="h-8 bg-slate-200 rounded w-3/4" />
                                            <div className="h-12 bg-slate-200 rounded w-full" />
                                            <div className="h-12 bg-slate-200 rounded w-full" />
                                        </div>
                                        <div className="mt-auto pt-4 h-10 bg-slate-200 rounded-lg w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        services.slice(0, 3).map((service) => (
                            <ServiceCard key={service.id} item={service} />
                        ))
                    )}
                </div>

                {/* View All Services CTA - using shared component */}
                <ViewAllButton label="View All Services" to="/services" />
            </div>
        </section>
    );
}

export default WhatWeProvide;
