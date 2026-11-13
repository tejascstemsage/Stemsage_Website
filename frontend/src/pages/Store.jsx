import { useState, useEffect } from "react";
import Footer from "../components/common/Footer";
import { ProductCard, mapApiProduct } from "../components/home/OurProducts";
import { getProducts } from "../services/productService";
import { fallbackProducts } from "../constants/fallbackProducts";

import bannerBg from "../assets/services/Courses.png";
import eduKitBg from "../assets/Edu-kit.webp";

function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        setLoading(true);
        const apiProducts = await getProducts();
        if (!cancelled) {
          if (apiProducts && apiProducts.length > 0) {
            // Map API products to card shape and format prices
            const mapped = apiProducts.map((p, i) => mapApiProduct(p, i));
            setProducts(mapped);
          } else {
            // API succeeded but returned empty
            setProducts(fallbackProducts);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch products for store, using fallback:", err.message);
        if (!cancelled) {
          setProducts(fallbackProducts);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="w-full bg-white font-sans text-slate-800">
      {/* ─── Top Background Banner ─── */}
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px] w-full overflow-hidden bg-slate-900">
        <img
          src={bannerBg}
          alt="STEMSAGE Store Banner"
          className="h-full w-full object-cover object-center opacity-85 blur-[1px]"
          onError={(e) => {
            e.currentTarget.src = eduKitBg;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* ─── Floating White Intro Box ─── */}
      <div className="relative z-10 mx-auto -mt-28 sm:-mt-36 md:-mt-48 max-w-4xl px-4 sm:px-6">
        <div className="bg-white border border-slate-200/90 shadow-xl px-6 py-10 sm:px-12 sm:py-14 md:px-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-slate-900 mb-6">
            Our <span className="text-red-600 font-medium">Products</span>
          </h1>
          <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-600 font-normal">
            Explore our range of innovative STEM kits and educational products, designed to inspire the next generation of makers and innovators.
          </p>
        </div>
      </div>

      {/* ─── Products Grid ─── */}
      <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24 px-5 sm:px-8">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="group relative flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                    <div className={`relative overflow-hidden rounded-t-xl h-40 flex items-center justify-center bg-slate-100`}>
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <div className="h-10 w-10 rounded-lg bg-slate-300 flex items-center justify-center">
                          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">Product Image</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 pt-4 pb-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow shadow-red-600/25" />
                      <div className="space-y-1">
                        <div className="h-6 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="mx-4 h-px bg-slate-100" />
                    <div className="flex flex-1 flex-col px-5 pt-4 pb-5 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-full" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="mt-3 flex flex-wrap gap-1">
                        <div className="h-6 bg-slate-200 rounded-full w-20" />
                        <div className="h-6 bg-slate-200 rounded-full w-20" />
                        <div className="h-6 bg-slate-200 rounded-full w-20" />
                      </div>
                      <div className="flex-1" />
                      <div className="my-3 h-px w-full bg-slate-100" />
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="h-3 bg-slate-200 rounded w-16" />
                          <div className="h-6 bg-slate-200 rounded w-24" />
                        </div>
                        <div className="h-10 w-24 bg-slate-200 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-medium">
              Nothing here yet
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {products.map((product, index) => {
                const firstFeaturedIndex = products.findIndex(p => p.featured);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFirstFeatured={index === firstFeaturedIndex}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

export default Store;
