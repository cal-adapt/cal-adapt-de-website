import path from "path";

const buildEslintCommand = (filenames) =>
  `eslint --fix ${filenames.map((f) => `"${path.relative(process.cwd(), f)}"`).join(" ")}`;

export default {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
  "*.{js,jsx,ts,tsx,css,scss,md,html,json}": "prettier --write",
};
