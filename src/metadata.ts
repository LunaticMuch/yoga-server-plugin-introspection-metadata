export const schemaMetadataByKind = {
    // Metadata for things of the kind "OBJECT"
    OBJECT: {
      Query: {
        // Arbitrary metadata about the MyType Object
        metadata: {
          foo: "bar",
          baz: "bop",
        },
      },
      Track: {
        metadata: {
          foo: "bar",
          baz: "bop",
        },
        fields: {
          modulesCount: {
            metadata: {
              foo: "bar",
              baz: "bop",
            },
          },
        },
      },
    },
  };