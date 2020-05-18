const sveltePreprocess = require("svelte-preprocess");
const tailwindCSS = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = {
    preprocess: sveltePreprocess({
        typescript: {
            tsconfigDirectory: ".",
            compilerOptions: { noEmit: false },
        },
        postcss: {
            plugins: [tailwindCSS, autoprefixer],
        },
    }),
};
