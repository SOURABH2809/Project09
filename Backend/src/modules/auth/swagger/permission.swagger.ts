import { createAuthEndpoint, successSchema } from "./factory.js";

const BASE_URL = "/api/v1/permissions";

export const permissionSwagger = {
  /**
   * GET & POST /api/v1/permissions
   */
  ...createAuthEndpoint(
    BASE_URL,
    {
      /* ----------------------------------
         CREATE PERMISSION
      ----------------------------------- */
      post: {
        config: {
          summary: "Create permission",
          description: "Create a new permission",
          body: {
            required: ["name", "normalizedName"],
            properties: {
              name: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                example: "USER.CREATE",
              },
              normalizedName: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                example: "USER_CREATE",
              },
              description: {
                type: "string",
                maxLength: 255,
                nullable: true,
                example: "Permission to create users",
              },
            },
          },
          responses: {
            201: {
              description: "Permission created successfully",
              schema: successSchema("Permission created successfully.", {
                id: { type: "string", example: "permission-uuid" },
                name: { type: "string", example: "USER.CREATE" },
                normalizedName: { type: "string", example: "USER_CREATE" },
                description: { type: "string", nullable: true },
              }),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            409: { description: "Permission already exists" },
          },
        },
        secure: true,
      },

      /* ----------------------------------
         GET ALL PERMISSIONS
      ----------------------------------- */
      get: {
        config: {
          summary: "Get all permissions",
          description: "Retrieve all permissions",
          responses: {
            200: {
              description: "Permissions retrieved successfully",
              schema: successSchema("Permissions fetched successfully.", {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "permission-uuid" },
                    name: { type: "string", example: "USER.CREATE" },
                    normalizedName: { type: "string", example: "USER_CREATE" },
                    description: { type: "string", nullable: true },
                  },
                },
              }),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        secure: true,
      },
    },
    ["Permissions"],
  ),

  /**
   * GET, PUT & DELETE /api/v1/permissions/{permissionId}
   */
  ...createAuthEndpoint(
    `${BASE_URL}/{permissionId}`,
    {
      /* ----------------------------------
         GET PERMISSION BY ID
      ----------------------------------- */
      get: {
        config: {
          summary: "Get permission by ID",
          description: "Retrieve permission details by ID",
          params: [
            {
              name: "permissionId",
              in: "path",
              required: true,
              schema: { type: "string", example: "permission-uuid" },
            },
          ],
          responses: {
            200: {
              description: "Permission retrieved successfully",
              schema: successSchema("Permission fetched successfully.", {
                id: { type: "string" },
                name: { type: "string" },
                normalizedName: { type: "string" },
                description: { type: "string", nullable: true },
              }),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Permission not found" },
          },
        },
        secure: true,
      },

      /* ----------------------------------
         UPDATE PERMISSION
      ----------------------------------- */
      put: {
        config: {
          summary: "Update permission",
          description: "Update permission details",
          params: [
            {
              name: "permissionId",
              in: "path",
              required: true,
              schema: { type: "string", example: "permission-uuid" },
            },
          ],
          body: {
            properties: {
              name: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                nullable: true,
                example: "USER.UPDATE",
              },
              normalizedName: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                nullable: true,
                example: "USER_UPDATE",
              },
              description: {
                type: "string",
                maxLength: 255,
                nullable: true,
                example: "Updated permission description",
              },
            },
          },
          responses: {
            200: {
              description: "Permission updated successfully",
              schema: successSchema("Permission updated successfully.", {
                id: { type: "string", example: "permission-uuid" },
                name: { type: "string", example: "USER.UPDATE" },
                normalizedName: { type: "string", example: "USER_UPDATE" },
                description: { type: "string", nullable: true },
              }),
            },
            400: { description: "No fields provided for update" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Permission not found" },
            409: { description: "Permission already exists" },
          },
        },
        secure: true,
      },

      /* ----------------------------------
         DELETE PERMISSION
      ----------------------------------- */
      delete: {
        config: {
          summary: "Delete permission",
          description: "Delete permission by ID",
          params: [
            {
              name: "permissionId",
              in: "path",
              required: true,
              schema: { type: "string", example: "permission-uuid" },
            },
          ],
          responses: {
            200: {
              description: "Permission deleted successfully",
              schema: successSchema("Permission deleted successfully"),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Permission not found" },
          },
        },
        secure: true,
      },
    },
    ["Permissions"],
  ),

  // endpoint grouping by module/page/subfeature
  ...createAuthEndpoint(
    `${BASE_URL}/features`,
    {
      get: {
        config: {
          summary: "Get permissions organized by module/page/subfeature",
          description:
            "Return a hierarchical list of permissions grouped by module and page, including any sub-features.",
          responses: {
            200: {
              description: "Permissions fetched successfully",
              schema: successSchema("Permissions fetched successfully.", {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    moduleKey: { type: "string" },
                    moduleName: { type: "string" },
                    pages: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          pageKey: { type: "string" },
                          pageName: { type: "string" },
                          resource: { type: "string" },
                          actions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                                normalizedName: { type: "string" },
                                action: { type: "string" },
                                description: { type: "string", nullable: true },
                              },
                            },
                          },
                          subFeatures: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                subFeatureKey: { type: "string" },
                                subFeatureName: { type: "string", nullable: true },
                                actions: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      id: { type: "string" },
                                      name: { type: "string" },
                                      normalizedName: { type: "string" },
                                      action: { type: "string" },
                                      description: { type: "string", nullable: true },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              }),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        secure: true,
      },
    },
    ["Permissions"],
  ),
};
