import {
  ApiResponses,
  AuthApiConfig,
  AuthGetApiConfig,
  QueryParameter,
  PathParameter,
} from "../types/swagger.js";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

/**
 * Standard success response
 */
export const successSchema = (
  message: string,
  data?: Record<string, unknown>,
  extra?: Record<string, unknown>,
) => ({
  type: "object",
  properties: {
    status: { type: "string", example: "success" },
    message: { type: "string", example: message },
    ...(data && {
      data:
        data.type && typeof data.type === "string"
          ? data
          : {
              type: "object",
              properties: data,
            },
    }),
    ...extra,
  },
});

/**
 * Build API responses
 */
const buildResponses = (responses: ApiResponses): Record<string, unknown> => {
  return Object.entries(responses).reduce(
    (acc, [status, response]) => {
      acc[status] = {
        description: response.description,
        ...(response.schema && {
          content: {
            "application/json": {
              schema: response.schema,
            },
          },
        }),
        headers: response.headers,
      };
      return acc;
    },
    {} as Record<string, unknown>,
  );
};

/**
 * Build request body (POST / PUT / PATCH)
 */
const buildRequestBody = (body?: AuthApiConfig["body"], path?: string) => {
  if (!body) return undefined;

  const properties = { ...body.properties };
  let required = [...(body.required || [])];

  // If path contains customerId, remove customerIds from body to avoid redundancy
  if (path && path.includes("{customerId}")) {
    delete (properties as any).customerIds;
    required = required.filter((r) => r !== "customerIds");
  }

  return {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required,
          properties,
        },
      },
    },
  };
};

/**
 * Merge path + query parameters
 */
const buildParameters = (params?: PathParameter[], queryParams?: QueryParameter[]) => {
  const allParams = [...(params || []), ...(queryParams || [])];
  return allParams.length ? allParams : undefined;
};

/**
 * Build security section
 */
const buildSecurity = (secure: boolean) => {
  return secure ? [{ BearerAuth: [] }] : undefined;
};

/**
 * Helper to filter params that are actually in the path
 */
const filterParamsForPath = (path: string, params?: PathParameter[]) => {
  if (!params) return undefined;
  return params.filter((p) => path.includes(`{${p.name}}`));
};

/**
 * Base factory
 */
export const createAuthMethod = (
  method: HttpMethod,
  path: string | string[],
  config: AuthApiConfig | AuthGetApiConfig,
  secure = false,
  tags: string[] = ["Auth"],
): Record<string, Record<string, unknown>> => {
  const hasBody = method !== "get";
  const paths = Array.isArray(path) ? path : [path];

  const result: Record<string, Record<string, unknown>> = {};

  paths.forEach((p) => {
    // Filter parameters to only include those in the current path string
    const filteredPathParams = filterParamsForPath(p, config.params);

    result[p] = {
      [method]: {
        tags,
        summary: config.summary,
        ...(config.description && { description: config.description }),
        ...(buildSecurity(secure) && { security: buildSecurity(secure) }),

        // Request body (POST / PUT / PATCH)
        ...(hasBody &&
          "body" in config && {
            requestBody: buildRequestBody((config as AuthApiConfig).body, p),
          }),

        // Path + Query parameters
        ...(hasBody
          ? {
              parameters: buildParameters(
                filteredPathParams,
                "queryParams" in config ? config.queryParams : undefined,
              ),
            }
          : {
              parameters: buildParameters(
                filteredPathParams,
                "queryParams" in config ? config.queryParams : undefined,
              ),
            }),

        responses: buildResponses(config.responses),
      },
    };
  });

  return result;
};

/**
 * Method helpers
 */
export const createAuthPost = (
  path: string | string[],
  config: AuthApiConfig,
  secure = false,
  tags: string[] = ["Auth"],
) => createAuthMethod("post", path, config, secure, tags);

export const createAuthGet = (
  path: string | string[],
  config: AuthGetApiConfig,
  secure = false,
  tags: string[] = ["Auth"],
) => createAuthMethod("get", path, config, secure, tags);

export const createAuthPut = (
  path: string | string[],
  config: AuthApiConfig,
  secure = false,
  tags: string[] = ["Auth"],
) => createAuthMethod("put", path, config, secure, tags);

export const createAuthPatch = (
  path: string | string[],
  config: AuthApiConfig,
  secure = false,
  tags: string[] = ["Auth"],
) => createAuthMethod("patch", path, config, secure, tags);

export const createAuthDelete = (
  path: string | string[],
  config: AuthGetApiConfig,
  secure = false,
  tags: string[] = ["Auth"],
) => createAuthMethod("delete", path, config, secure, tags);

/**
 * Multi-method endpoint helper
 */
export const createAuthEndpoint = (
  path: string,
  methods: {
    get?: { config: AuthGetApiConfig; secure?: boolean };
    post?: { config: AuthApiConfig; secure?: boolean };
    put?: { config: AuthApiConfig; secure?: boolean };
    patch?: { config: AuthApiConfig; secure?: boolean };
    delete?: { config: AuthApiConfig; secure?: boolean };
  },
  tags: string[] = ["Auth"],
): Record<string, Record<string, unknown>> => {
  const endpoint: Record<string, unknown> = {};

  Object.entries(methods).forEach(([method, options]) => {
    if (options) {
      const result = createAuthMethod(
        method as HttpMethod,
        "_temp",
        options.config,
        options.secure,
        tags,
      );
      const methodConfig = (result["_temp"] as Record<string, unknown>)[method];
      if (methodConfig) {
        endpoint[method] = methodConfig;
      }
    }
  });

  return { [path]: endpoint };
};
