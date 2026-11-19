import React from "react";

/* One icon family: 24px grid, 2px stroke, round caps. Replaces the
   unicode arrows and checks that used to stand in for icons. */
const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};

export const ArrowUpRight = (p) => (
  <svg {...base} className={`ico ${p.className || ""}`}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const ArrowLeft = (p) => (
  <svg {...base} className={`ico ${p.className || ""}`}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);
export const ArrowRight = (p) => (
  <svg {...base} className={`ico ${p.className || ""}`}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Check = (p) => (
  <svg {...base} className={`ico ${p.className || ""}`}>
    <path d="M5 12.5 10 17 19 7" />
  </svg>
);
