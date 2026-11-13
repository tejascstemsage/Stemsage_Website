import { Component } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";

/* -----------------------------------------------------------------------
   Error Boundary - catches render errors inside a route and shows a
   friendly message with Header and Footer still rendered
------------------------------------------------------------------------ */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800">
                    <Header />
                    <main className="flex-1 flex items-center justify-center px-4 py-24">
                        <div className="max-w-md w-full text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 text-3xl">
                                ⚠️
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                                Something went wrong
                            </h1>
                            <p className="text-sm text-slate-600 mb-6">
                                We couldn't load this page. Please try again.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.reload();
                                }}
                                className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-8 py-3 shadow-md transition-all duration-300 cursor-pointer"
                            >
                                Reload page
                            </button>
                        </div>
                    </main>
                    <Footer />
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;