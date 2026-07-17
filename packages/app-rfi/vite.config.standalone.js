import { defineConfig, transformWithEsbuild } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "AsuRfi",
      formats: ["umd"],
      fileName: () => "appRfi.standalone.umd.js",
    },
    rollupOptions: {
      input: resolve(__dirname, "src/index.js"),
    },
    minify: true,
    cssCodeSplit: false,
  },
  esbuild: {
    legalComments: "eof",
    keepNames: false,
  },
  define: {
    process: { env: { NODE_ENV: process.env.NODE_ENV } },
    global: {},
  },
  resolve: {
    alias: {
      "@asu/shared": resolve(__dirname, "../shared"),
    },
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    react(),
    {
      name: "treat-js-files-as-jsx",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;

        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
    {
      name: "inline-css",
      enforce: "post",
      generateBundle(options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type === "asset" && file.fileName.endsWith(".css")) {
            const jsFile = Object.values(bundle).find(
              f =>
                f.type === "chunk" &&
                (f.fileName.endsWith(".js") || f.fileName.endsWith(".mjs"))
            );
            if (jsFile) {
              jsFile.code += `\n(function() {
                var css = \`${file.source.toString().replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;
                var style = document.createElement('style');
                style.type = 'text/css';
                if (style.styleSheet) {
                  style.styleSheet.cssText = css;
                } else {
                  style.appendChild(document.createTextNode(css));
                }
                document.head.appendChild(style);
              })();`;
            }
          }
        }
      },
    },
  ],
});
