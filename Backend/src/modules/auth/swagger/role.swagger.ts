import { createAuthEndpoint, successSchema } from "./factory.js";

const BASE_URL = "/api/v1/roles";

export const roleSwagger = {
  /**
   * GET & POST /api/v1/roles
   */
  ...createAuthEndpoint(
    BASE_URL,
    {
      get: {
        config: {
          summary: "Get all roles",
          description: "Retrieve all available roles",
          responses: {
            200: {
              description: "Roles retrieved successfully",
              schema: successSchema("Roles retrieved successfully", {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "role-uuid" },
                    name: { type: "string", example: "ADMIN" },
                    normalizedName: { type: "string", example: "Admin" },
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

      post: {
        config: {
          summary: "Create role",
          description: "Create a new role",
          body: {
            required: ["name", "normalizedName"],
            properties: {
              name: { type: "string", minLength: 1, example: "ADMIN" },
              normalizedName: { type: "string", minLength: 1, example: "Admin" },
              description: { type: "string", nullable: true, example: "Full system access" },
            },
          },
          responses: {
            201: {
              description: "Role created successfully",
              schema: successSchema("Role added successfully", {
                id: { type: "string", example: "role-uuid" },
                name: { type: "string", example: "ADMIN" },
                normalizedName: { type: "string", example: "Admin" },
                description: { type: "string", nullable: true },
              }),
            },
            409: { description: "Role already exists" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        secure: true,
      },
    },
    ["Roles"],
  ),

  /**
   * PATCH & DELETE /api/v1/roles/{roleId}
   */
  ...createAuthEndpoint(
    `${BASE_URL}/{roleId}`,
    {
      patch: {
        config: {
          summary: "Edit role",
          description: "Update role details",
          params: [
            {
              name: "roleId",
              in: "path",
              required: true,
              schema: { type: "string", example: "role-uuid" },
            },
          ],
          body: {
            required: ["name", "normalizedName"],
            properties: {
              name: { type: "string", minLength: 1, example: "SUPER_ADMIN" },
              normalizedName: { type: "string", minLength: 1, example: "Super Admin" },
              description: { type: "string", nullable: true, example: "Administrative role" },
            },
          },
          responses: {
            200: {
              description: "Role updated successfully",
              schema: successSchema("Role updated successfully"),
            },
            404: { description: "Role not found" },
            409: { description: "Role already exists" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        secure: true,
      },

      delete: {
        config: {
          summary: "Delete role",
          description: "Delete role by ID",
          params: [
            {
              name: "roleId",
              in: "path",
              required: true,
              schema: { type: "string", example: "role-uuid" },
            },
          ],
          responses: {
            200: {
              description: "Role deleted successfully",
              schema: successSchema("Role deleted successfully"),
            },
            404: { description: "Role not found" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        secure: true,
      },
    },
    ["Roles"],
  ),

  /**
   * PUT & GET /api/v1/roles/{roleId}/permissions
   */
  ...createAuthEndpoint(
    `${BASE_URL}/{roleId}/permissions`,
    {
      put: {
        config: {
          summary: "Assign permissions to role",
          description: "Replace all permissions of a role",
          params: [
            {
              name: "roleId",
              in: "path",
              required: true,
              schema: { type: "string", example: "role-uuid" },
            },
          ],
          body: {
            required: ["permissions"],
            properties: {
              permissions: {
                type: "array",
                items: { type: "string", example: "permission-uuid" },
              },
            },
          },
          responses: {
            200: {
              description: "Permissions assigned successfully",
              schema: successSchema("Permissions assigned successfully"),
            },
            400: { description: "Invalid permission IDs" },
            404: { description: "Role not found" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        secure: true,
      },

      get: {
        config: {
          summary: "Get role permissions",
          description: "Retrieve all permissions assigned to a role",
          params: [
            {
              name: "roleId",
              in: "path",
              required: true,
              schema: { type: "string", example: "role-uuid" },
            },
          ],
          responses: {
            200: {
              description: "Permissions retrieved successfully",
              schema: successSchema("All permissions retrieved of role successfully", {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    normalizedName: { type: "string" },
                    description: { type: "string", nullable: true },
                  },
                },
              }),
            },
            404: { description: "Role not found" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        secure: true,
      },
    },
    ["Roles", "Permissions"],
  ),
};
