export type RequestBody = {
  required?: string[];
  properties: Record<string, unknown>;
};

export type ApiResponses = Record<
  number,
  {
    description: string;
    schema?: Record<string, unknown>;
    content?: Record<string, unknown>;
    headers?: Record<string, unknown>;
  }
>;

export type QueryParameter = {
  name: string;
  in: "query";
  required?: boolean;
  schema: {
    type: string;
    format?: string;
    example?: unknown;
    default?: unknown;
    enum?: unknown[];
  };
  description?: string;
};

export type PathParameter = {
  name: string;
  in: "path";
  required: true;
  schema: {
    type: string;
    format?: string;
    example?: unknown;
  };
  description?: string;
};

export type AuthApiConfig = {
  summary: string;
  description?: string;
  body?: RequestBody;
  params?: PathParameter[];
  queryParams?: QueryParameter[];
  responses: ApiResponses;
};

export type AuthGetApiConfig = {
  summary: string;
  description?: string;
  queryParams?: QueryParameter[];
  params?: PathParameter[];
  responses: ApiResponses;
};
