import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NAV = [
  {
    labelKey: "orders",
    path: "/orders",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
    activeText: "#a5b4fc",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    labelKey: "payments",
    path: "/payments",
    color: "#10b981",
    bg: "rgba(16,185,129,0.10)",
    activeText: "#6ee7b7",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

const LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "hi", label: "हि", full: "हिंदी" },
  { code: "te", label: "తె", full: "తెలుగు" },
];

export default function Navbar({ businessName = "OrderDesk" }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest(".nb-lang")) setLangOpen(false);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  const isActive = (item) => location.pathname.startsWith(item.path);

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    setLangOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        :root { --nh: 56px; --bg: #0d0f14; --border: rgba(255,255,255,0.07); --muted: #64748b; --bright: #f1f5f9; }

        .nb {
          position: sticky; top: 0; z-index: 300;
          height: var(--nh); background: var(--bg);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          padding: 0 24px; gap: 4px;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.25s;
        }
        .nb.scrolled { box-shadow: 0 8px 32px rgba(0,0,0,0.4); }

        .nb-brand {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; margin-right: 20px; flex-shrink: 0;
        }
        .nb-logo {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center; font-size: 14px;
        }
        .nb-name {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 16px; color: var(--bright); letter-spacing: -0.3px;
        }

        .nb-link {
          display: flex; align-items: center; gap: 7px;
          padding: 6px 16px; border-radius: 8px;
          font-size: 14px; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .nb-link:hover { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .nb-link svg { flex-shrink: 0; opacity: 0.65; transition: opacity 0.15s; }
        .nb-link:hover svg, .nb-link.active svg { opacity: 1; }

        /* Language switcher */
        .nb-lang {
          margin-left: auto; position: relative;
        }
        .nb-lang-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: #cbd5e1; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .nb-lang-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.15); }
        .nb-lang-arrow {
          width: 10px; height: 10px; opacity: 0.5;
          transition: transform 0.2s;
        }
        .nb-lang-arrow.open { transform: rotate(180deg); }

        .nb-lang-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #161a24; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; overflow: hidden;
          min-width: 130px; z-index: 400;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nb-lang-option {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; cursor: pointer;
          font-size: 13px; font-weight: 500; color: #94a3b8;
          transition: background 0.12s, color 0.12s;
        }
        .nb-lang-option:hover { background: rgba(255,255,255,0.06); color: #f1f5f9; }
        .nb-lang-option.selected { color: #a5b4fc; background: rgba(99,102,241,0.12); }
        .nb-lang-badge {
          font-size: 15px; width: 24px; text-align: center;
        }
      `}</style>

      <nav className={`nb${scrolled ? " scrolled" : ""}`}>
        <Link to="/" className="nb-brand">
          <div className="nb-logo">📦</div>
          <span className="nb-name">{businessName}</span>
        </Link>

        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nb-link${active ? " active" : ""}`}
              style={
                active ? { color: item.activeText, background: item.bg } : {}
              }
            >
              {item.icon}
              {t(item.labelKey)}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: "20%",
                    right: "20%",
                    height: 2,
                    borderRadius: "2px 2px 0 0",
                    background: item.color,
                  }}
                />
              )}
            </Link>
          );
        })}

        <div className="nb-lang">
          <button
            className="nb-lang-btn"
            onClick={() => setLangOpen((p) => !p)}
          >
            {currentLang.label}
            <svg
              className={`nb-lang-arrow${langOpen ? " open" : ""}`}
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M2 3.5l3 3 3-3" />
            </svg>
          </button>

          {langOpen && (
            <div className="nb-lang-dropdown">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className={`nb-lang-option${i18n.language === lang.code ? " selected" : ""}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <span className="nb-lang-badge">{lang.label}</span>
                  {lang.full}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
