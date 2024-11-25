import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import IntrospectionMetadataPlugin from "./plugin.js";
import { schemaMetadataByKind } from "./metadata.js";

const schema = await loadSchema("./**/*.graphql", {
  // load files and merge them into a single schema object
  loaders: [new GraphQLFileLoader()],
});

const yogaPlugins = [];

yogaPlugins.push(IntrospectionMetadataPlugin(schemaMetadataByKind));

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema, plugins: yogaPlugins });

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
