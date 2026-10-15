import { createAuthEndpoint, successSchema } from "./factory.js";

const BASE_URL = "/api/v1/groups";

export const userGroupSwagger = {
  /**
   * GET & POST /api/v1/groups
   */
  ...createAuthEndpoint(
    BASE_URL,
    {
      /* ----------------------------------
         CREATE USER GROUP
      ----------------------------------- */
      post: {
        config: {
          summary: "Create user group",
          description: "Create a new user group",
          body: {
            required: ["name", "normalizedName"],
            properties: {
              name: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                example: "Admins",
              },
              normalizedName: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                example: "ADMINS",
              },
              description: {
                type: "string",
                maxLength: 255,
                nullable: true,
                example: "System administrators group",
              },
            },
          },
          responses: {
            201: {
              description: "User group created successfully",
              schema: successSchema("UserGroup created successfully"),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            409: { description: "User group already exists" },
          },
        },
        secure: true,
      },

      /* ----------------------------------
         GET ALL USER GROUPS
      ----------------------------------- */
      get: {
        config: {
          summary: "Get all user groups",
          description: "Retrieve all user groups",
          responses: {
            200: {
              description: "Groups retrieved successfully",
              schema: successSchema("UserGroup retrieved successfully", {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "857e5b7c-0812-4cf5-a2ad-a7647485d02c" },
                    name: { type: "string", example: "Finance" },
                    normalizedName: { type: "string", example: "Finance" },
                    description: { type: "string", nullable: true, example: "Finance User Group" },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                      example: "2026-02-17T09:41:07.904Z",
                    },
                    updatedAt: {
                      type: "string",
                      format: "date-time",
                      example: "2026-02-17T09:41:07.904Z",
                    },
                    createdById: {
                      type: "string",
                      example: "4376b2cd-f902-4d8b-9145-88f16ddbb932",
                    },
                    updatedById: { type: "string", nullable: true, example: null },
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
    ["Groups"],
  ),

  /**
   * GET, PUT & DELETE /api/v1/groups/{groupId}
   */
  ...createAuthEndpoint(
    `${BASE_URL}/{groupId}`,
    {
      /* ----------------------------------
         GET GROUP WITH USERS
      ----------------------------------- */
      get: {
        config: {
          summary: "Get group with users",
          description: "Retrieve a group along with its users",
          params: [
            {
              name: "groupId",
              in: "path",
              required: true,
              schema: { type: "string", example: "group-uuid" },
            },
          ],
          responses: {
            200: {
              description: "Group retrieved successfully",
              schema: successSchema("UserGroup retrieved with users successfully", {
                id: { type: "string", example: "857e5b7c-0812-4cf5-a2ad-a7647485d02c" },
                name: { type: "string", example: "Finance" },
                normalizedName: { type: "string", example: "Finance" },
                description: { type: "string", nullable: true, example: "Finance User Group" },
                createdAt: {
                  type: "string",
                  format: "date-time",
                  example: "2026-02-17T09:41:07.904Z",
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                  example: "2026-02-17T09:41:07.904Z",
                },
                createdById: { type: "string", example: "4376b2cd-f902-4d8b-9145-88f16ddbb932" },
                updatedById: { type: "string", nullable: true, example: null },
                users: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "bd00c87a-6955-4e6e-80f1-4abe1ce33e4b" },
                      email: { type: "string", example: "finance1@test.eu" },
                      firstName: { type: "string", example: "Test3" },
                      lastName: { type: "string", example: "Finance" },
                    },
                  },
                },
              }),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Group not found" },
          },
        },
        secure: true,
      },

      /* ----------------------------------
         UPDATE USER GROUP
      ----------------------------------- */
      put: {
        config: {
          summary: "Update user group",
          description: "Update group name, normalized name or description",
          params: [
            {
              name: "groupId",
              in: "path",
              required: true,
              schema: { type: "string", example: "group-uuid" },
            },
          ],
          body: {
            properties: {
              name: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                nullable: true,
                example: "Managers",
              },
              normalizedName: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                nullable: true,
                example: "MANAGERS",
              },
              description: {
                type: "string",
                maxLength: 255,
                nullable: true,
                example: "Updated group description",
              },
            },
          },
          responses: {
            200: {
              description: "User group updated successfully",
              schema: successSchema("UserGroup updated successfully"),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Group not found" },
            409: { description: "Group name already exists" },
          },
        },
        secure: true,
      },

      /* ----------------------------------
         DELETE USER GROUP
      ----------------------------------- */
      delete: {
        config: {
          summary: "Delete user group",
          description: "Delete a user group",
          params: [
            {
              name: "groupId",
              in: "path",
              required: true,
              schema: { type: "string", example: "group-uuid" },
            },
          ],
          responses: {
            200: {
              description: "User group deleted successfully",
              schema: successSchema("UserGroup deleted successfully"),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Group not found" },
          },
        },
        secure: true,
      },
    },
    ["Groups"],
  ),

  /**
   * PUT /api/v1/groups/{groupId}/users
   */
  ...createAuthEndpoint(
    `${BASE_URL}/{groupId}/users`,
    {
      put: {
        config: {
          summary: "Assign users to group",
          description: "Replace all users assigned to a group",
          params: [
            {
              name: "groupId",
              in: "path",
              required: true,
              schema: { type: "string", example: "group-uuid" },
            },
          ],
          body: {
            required: ["users"],
            properties: {
              users: {
                type: "array",
                items: { type: "string" },
                example: ["user-id-1", "user-id-2"],
              },
            },
          },
          responses: {
            200: {
              description: "Users assigned successfully",
              schema: successSchema("Users assigned successfully"),
            },
            400: { description: "Invalid users" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Group not found" },
          },
        },
        secure: true,
      },
    },
    ["Groups"],
  ),

  /**
   * GET & PUT /api/v1/groups/{groupId}/roles
   */
  ...createAuthEndpoint(
    `${BASE_URL}/{groupId}/roles`,
    {
      put: {
        config: {
          summary: "Assign roles to group",
          description: "Replace all roles assigned to a group",
          params: [
            {
              name: "groupId",
              in: "path",
              required: true,
              schema: { type: "string", example: "group-uuid" },
            },
          ],
          body: {
            required: ["roles"],
            properties: {
              roles: {
                type: "array",
                items: { type: "string" },
                example: ["role-id-1", "role-id-2"],
              },
            },
          },
          responses: {
            200: {
              description: "Roles assigned successfully",
              schema: successSchema("Roles assigned successfully"),
            },
            400: { description: "Invalid role IDs" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Group not found" },
          },
        },
        secure: true,
      },

      get: {
        config: {
          summary: "Get roles of group",
          description: "Retrieve all roles assigned to a group",
          params: [
            {
              name: "groupId",
              in: "path",
              required: true,
              schema: { type: "string", example: "group-uuid" },
            },
          ],
          responses: {
            200: {
              description: "Roles retrieved successfully",
              schema: successSchema("Fetched roles of UserGroup successfully", {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "2c8197ae-9b9c-4024-bbf4-e824ebf4acb4" },
                    name: { type: "string", example: "CACAC" },
                    normalizedName: { type: "string", example: "CACAC" },
                  },
                },
              }),
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Group not found" },
          },
        },
        secure: true,
      },
    },
    ["Groups"],
  ),
};
