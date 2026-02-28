import { useState } from "react";

const DAISY_THEMES = [
  { name: "light", icon: "☀️" },
  { name: "dark", icon: "🌙" },
  { name: "cupcake", icon: "🧁" },
  { name: "bumblebee", icon: "🐝" },
  { name: "emerald", icon: "💚" },
  { name: "synthwave", icon: "🌌" },
  { name: "dim", icon: "🖤" },
];

function getInitialThemeIndex() {
  const savedTheme =
    document.documentElement.getAttribute("data-theme") ||
    localStorage.getItem("theme") ||
    "dim";

  const index = DAISY_THEMES.findIndex(
    (t) => t.name === savedTheme
  );

  document.documentElement.setAttribute("data-theme", savedTheme);

  return index >= 0 ? index : DAISY_THEMES.length - 1;
}

function ThemeButton({ size = 38, className = "" }) {
  const [themeIndex, setThemeIndex] = useState(getInitialThemeIndex);

  const handleThemeToggle = () => {
    const nextIndex = (themeIndex + 1) % DAISY_THEMES.length;
    const nextTheme = DAISY_THEMES[nextIndex].name;

    setThemeIndex(nextIndex);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return (
    <button
      onClick={handleThemeToggle}
      title="Switch theme"
      className={`
        flex items-center justify-center
        rounded-full
        bg-base-200 hover:bg-base-300
        shadow-sm hover:shadow-md
        transition-all duration-200
        active:scale-95
        ${className}
      `}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
      }}
    >
      <span className="transition-transform duration-200 hover:scale-110">
        {DAISY_THEMES[themeIndex].icon}
      </span>
    </button>
  );
}

export default ThemeButton;
