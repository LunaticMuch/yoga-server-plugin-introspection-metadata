# Metadata plugin for GraphQL Yoga

This plugin is a simple adaptation of [apollo-server-plugin-introspection-metadata](https://github.com/anvilco/apollo-server-plugin-introspection-metadata/tree/main) for GraphQL Yoga

## Rationale

Most (if not all) business environments require different levels of data governance on APIs. Data governance is a broad topic. Here, metadata comes into picture. The API normally carries the data, the structure or data and a simple human description. GraphQL does this already within the SDL. However, it does not rule for metadata.

Directive are too often described as a possible solution, however they open more problems rather than benefits. First, directives are defined as:

> Directives provide a way to describe alternate runtime execution and type validation behavior in a GraphQL document.

Thus, they do not really qualify for the role. Second, when introspecting the schema, the library, it is not possible to see where a directive is applied and with which parameters. This is for security reasons. Also, a schema containing too many directives per field could quickly become difficult to read, thus impacting the developer experience. Nonetheless, metadata are normally managed by everybody, not just engineers. Having metadata closely coupled with the schema would possibly make worse the experience of those creating the schema.

GraphQL community has discussed a lot about this but did not end with a decision whether to cater for metadata in the schema or leave it completely outside it.
<https://github.com/graphql/graphql-wg/discussions/1096>

## How it works

The plugin allows to define some metadata and add them to the output of a GraphQL introspection query. Because the output is added, by default, using the `onResultProcess` hook, the introspection query does not need to know the position or the format of metadata. Only the returned payload is transformed.
The tool reading the introspection, such as  GraphiQL, is not impacted by additional data. In this example you can see that the section docs (the documentation created using the introspection) is not impacted by the additional property being added to the introspection object.

## How to run it

After cloning, pull dependencies with

```bash
npm i
```

and then for running

```bash
npm run start:dev
```

## Possible evolution

To support a client control for metadata, it would be worth considering the usage of a custom executable directive at query level such as `includeMetadata`

```graphql
directive @includeMetadata on QUERY
```

This way the client could decide whether read metadata or not. Also, considering metadata residing not in a file but in a 3rd system, this could allow the client to take a choice whether to accept more latency for pulling metadata. It simplifies an open a range of possible solutions/optimizations.

## Limits

This is the beta version of the plugin. The code is unstyled and some parameters are defaulted.

## Example result

```json
{
  "data": {
    "__schema": {
      "queryType": {
        "name": "Query"
      },
      "mutationType": null,
      "subscriptionType": null,
      "types": [
        {
          "kind": "OBJECT",
          "name": "Query",
          "description": null,
          "fields": [
            {
              "name": "tracksForHome",
              "description": "Get tracks array for homepage grid",
              "args": [],
              "type": {
                "kind": "NON_NULL",
                "name": null,
                "ofType": {
                  "kind": "LIST",
                  "name": null,
                  "ofType": {
                    "kind": "NON_NULL",
                    "name": null,
                    "ofType": {
                      "kind": "OBJECT",
                      "name": "Track"
                    }
                  }
                }
              },
              "isDeprecated": false,
              "deprecationReason": null
            }
          ],
          "inputFields": null,
          "interfaces": [],
          "enumValues": null,
          "possibleTypes": null,
          "metadata": {
            "foo": "bar",
            "baz": "bop"
          }
        }
      ]
    }
  }
}
```
