const sveltePreprocess  = require("svelte-preprocess");

module.exports = {
    preprocess: sveltePreprocess({
        typescript: {
            compilerOptions: { noEmit: false }
        }
    }),
};