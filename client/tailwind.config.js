/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xxs: ".625rem",
      },
      cursor: {
        fancy: "url(/cursor.png), pointer",
        pointer: "url(/cursor.png), pointer",
        grab: "url(/grab.png), grab",
      },
      strokeWidth: {
        8: "8px",
      },
      colors: {
        gold: "#E0AF65",
        crimson: "#89192D",
        brilliance: "#7DFFBA",
        orange: "#FE993C",
        yellow: "#FAFF00",
        red: "#FF0000",
        "anger-light": "#CD8290",
        "gray-gold": "#776756",
        "light-pink": "#CAB1A6",
        gray: "#1B1B1B",
        brown: "#24130A",
        "light-red": "#EF5858",
        dark: "#48413C",
        "dark-brown": "#54433A",
        danger: "#C84444",
        "dark-green": "#064105",
        "dark-green-accent": "#3A3D23",
        green: "#33FF00",
        lightest: "#FFF5EA",
        order: {
          power: "#F4B547",
          giants: "#EB544D",
          titans: "#EC68A8",
          skill: "#706DFF",
          perfection: "#8E35FF",
          twins: "#0020C6",
          reflection: "#00A2AA",
          detection: "#139757",
          fox: "#D47230",
          vitriol: "#59A509",
          brilliance: "#7DFFBA",
          enlightenment: "#1380FF",
          protection: "#00C3A1",
          fury: "#82005E",
          rage: "#C74800",
          anger: "#89192D",
          gods: "#94a3b8",
        },
      },
    },
  },
  safelist: [
    "bg-order-power",
    "bg-order-giants",
    "bg-order-titans",
    "bg-order-brilliance",
    "bg-order-skill",
    "bg-order-perfection",
    "bg-order-twins",
    "bg-order-reflection",
    "bg-order-detection",
    "bg-order-fox",
    "bg-order-vitriol",
    "bg-order-enlightenment",
    "bg-order-protection",
    "bg-order-fury",
    "bg-order-rage",
    "bg-order-anger",
    "bg-order-gods",
    "fill-order-power",
    "fill-order-giants",
    "fill-order-titans",
    "fill-order-brilliance",
    "fill-order-skill",
    "fill-order-perfection",
    "fill-order-twins",
    "fill-order-reflection",
    "fill-order-detection",
    "fill-order-fox",
    "fill-order-vitriol",
    "fill-order-enlightenment",
    "fill-order-protection",
    "fill-order-fury",
    "fill-order-rage",
    "fill-order-anger",
    "fill-order-gods",
    "stroke-order-power",
    "stroke-order-giants",
    "stroke-order-titans",
    "stroke-order-brilliance",
    "stroke-order-skill",
    "stroke-order-perfection",
    "stroke-order-twins",
    "stroke-order-reflection",
    "stroke-order-detection",
    "stroke-order-fox",
    "stroke-order-vitriol",
    "stroke-order-enlightenment",
    "stroke-order-protection",
    "stroke-order-fury",
    "stroke-order-rage",
    "stroke-order-anger",
    "stroke-order-gods",
    "text-order-power",
    "text-order-giants",
    "text-order-titans",
    "text-order-brilliance",
    "text-order-skill",
    "text-order-perfection",
    "text-order-twins",
    "text-order-reflection",
    "text-order-detection",
    "text-order-fox",
    "text-order-vitriol",
    "text-order-enlightenment",
    "text-order-protection",
    "text-order-fury",
    "text-order-rage",
    "text-order-anger",
    "text-order-gods",
  ],
  plugins: [],
};
