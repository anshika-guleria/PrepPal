import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  
  daisyui: {
    // You can choose default themes, or define your own
    themes: [
      "light",       // default light theme
      "dark",        // default dark theme
      "cupcake",     // another preset theme
      "bumblebee",   // optional
      "emerald",
      "synthwave",
      "dim"
    ],
    darkTheme: "dark", // optional, default dark theme
  },
};
