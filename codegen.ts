import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://api.airstack.xyz/gql",
  documents: "src/lib/airstack.ts",
  generates: {
    // Output type file
    "src/lib/airstack-types.ts": {
      // add to plugins: @graphql-codegen/typescript and @graphql-codegen/typescript-operations
      plugins: ["typescript", "typescript-operations"],
      config: {
        avoidOptionals: true,
        skipTypename: true,
      },
    },
  },
};

export default config;
