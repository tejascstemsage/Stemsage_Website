import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { googleAuthenticate } from "../../services/authService";

export default function GoogleAuthButton({ buttonText = "Log in with Google", onError }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const googleOverlayRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    if (loading) return;

    if (!response || !response.credential) {
      if (onError) onError("Google authentication failed. Please try again.");
      return;
    }

    try {
      setLoading(true);
      if (onError) onError(null); // Clear previous errors

      const res = await googleAuthenticate(response.credential);

      if (res && res.success && res.data) {
        await login(res.data.token, res.data.user);
        navigate("/");
      } else {
        throw new Error(res?.message || "Google authentication failed.");
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      if (onError) {
        onError(err.message || "Unable to connect to the server. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not configured in environment.");
      return;
    }

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleOverlayRef.current) {
            googleOverlayRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleOverlayRef.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              width: 360,
            });
          }
        } catch (e) {
          console.error("Failed to initialize Google Identity Services:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const existingScript = document.getElementById("google-gsi-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initGoogle);
      }
    }
  }, []);

  const handleClick = () => {
    if (loading) return;
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      if (onError) onError("Google authentication service is loading. Please try again.");
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="relative w-full h-11 border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center px-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
      >
        {/* Invisible Google GIS Button Overlay */}
        {!loading && (
          <div
            ref={googleOverlayRef}
            className="absolute inset-0 opacity-0 z-10 overflow-hidden cursor-pointer flex items-center justify-center [&>div]:w-full [&>div]:h-full"
            style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
          />
        )}

        {/* Custom Visual Button */}
        {loading ? (
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-slate-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm font-normal text-slate-800">
              Authenticating...
            </span>
          </div>
        ) : (
          <>
            <div className="absolute left-4 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span className="text-sm font-normal text-slate-800">
              {buttonText}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
