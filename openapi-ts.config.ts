import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    input: "http://127.0.0.1:8000/api/schema/",
    output: {
        path: "src/client",
        postProcess: ["prettier"],
    },
    plugins: ["@hey-api/client-axios"],
});
