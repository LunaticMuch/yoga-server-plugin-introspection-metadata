import _ from "lodash";
import { Readable } from "node:stream";
import { Plugin, shouldRenderGraphiQL } from "graphql-yoga";

export const REGEX_INTROSPECTION_QUERY = /\b(__schema|__type)\b/;

const KIND_OBJECT = "OBJECT";
const KIND_INPUT_OBJECT = "INPUT_OBJECT";
const KIND_ENUM = "ENUM";
const KIND_INTERFACE = "INTERFACE";

const FIELDS_KEY_FIELDS = "fields";
const FIELDS_KEY_INPUT_FIELDS = "inputFields";
const FIELDS_KEY_ENUM_FIELDS = "enumValues";
const FIELDS_KEY_DEFAULT = FIELDS_KEY_FIELDS;

const KIND_TO_FIELDS_KEY = {
  [KIND_OBJECT]: FIELDS_KEY_FIELDS,
  [KIND_INPUT_OBJECT]: FIELDS_KEY_INPUT_FIELDS,
  [KIND_ENUM]: FIELDS_KEY_ENUM_FIELDS,
  [KIND_INTERFACE]: FIELDS_KEY_FIELDS,
};

interface Type {
  name: string;
  kind: string;
  [key: string]: any;
}

interface Field {
  name: string;
  args?: any[];
  [key: string]: any;
}

interface Arg {
  name: string;
  [key: string]: any;
}

export default function IntrospectionMetadataPlugin<
  TPluginContext extends Record<string, unknown>
>(schemaMetadata: any): Plugin<TPluginContext> {
  return {
    onResultProcess: ({ result }: { result: any }) => {
      const metadataSourceKey = "metadata";
      const metadataTargetKey = "metadata";

      function augmentArg({ arg = {} as Arg, argsMetadata = {} }) {
        const { name } = arg;

        // Bail if we don't have it
        if (!name) return;

        const argsMetadataForName = argsMetadata[name] || {};
        const argMetadata = _.get(argsMetadataForName, metadataSourceKey);

        // Add metadata for this Arg
        if (argMetadata) {
          _.set(arg, metadataTargetKey, argMetadata);
        }
      }

      function augmentField({ field = {} as Field, fieldsMetadata = {} }) {
        let { name, args = [] } = field || {};

        // Bail if we don't have it
        if (!name) return;

        args ??= [];

        const fieldsMetadataForName = fieldsMetadata[name] || {};
        const fieldMetadata = _.get(fieldsMetadataForName, metadataSourceKey);
        const { args: argsMetadata = {} } = fieldsMetadataForName;

        // Add metadata for this Field
        if (fieldMetadata) {
          _.set(field, metadataTargetKey, fieldMetadata);
        }

        // Go through all the args for this Field and augment them
        args.forEach((arg) => augmentArg({ arg, argsMetadata }));
      }

      function augmentType({ type = {} as Type, schemaMetadata = {} }) {
        let { name, kind } = type || {};
        // Bail if we don't have it
        if (!name) return;
        const fieldsKey = KIND_TO_FIELDS_KEY[kind] || FIELDS_KEY_DEFAULT;

        const fields = type[fieldsKey] || [];
        const metadatasForKind = schemaMetadata[kind] || {};
        // Bail if we don't have it
        if (!metadatasForKind) {
          return;
        }
        const metaDatasForName = metadatasForKind[name] || {};
        const typeMetadata = _.get(metaDatasForName, metadataSourceKey);
        const { [fieldsKey]: fieldsMetadata = {} } = metaDatasForName;

        // Add the metadata for this Type
        if (typeMetadata) {
          _.set(type, metadataTargetKey, typeMetadata);
        }

        // Go through all the fields for this Type and augment them
        fields.forEach((field) => augmentField({ field, fieldsMetadata }));
      }

      const { types = [] } = result?.data?.__schema || result?.__schema || {};
      types.forEach((type) => augmentType({ type, schemaMetadata }));
    },
  };
}
