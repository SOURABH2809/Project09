import {
  createAuthPut,
  createAuthDelete,
  createAuthGet,
  createAuthEndpoint,
  createAuthPatch,
  successSchema,
} from "./factory.js";

const BASE_URL = "/api/v1/users";

export const userSwagger = {
  /**
   * GET & PUT /api/v1/users
   */
  ...createAuthEndpoint(
    BASE_URL,
    {
      get: {
        config: {
          summary: "Get all users",
          description: "Retrieve all users with filters, sorting, and pagination",
          queryParams: [
            {
              name: "email",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "name",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
              },
            },
            {
              name: "groups",
              in: "query",
              schema: {
                type: "array",
              },
            },
            {
              name: "page",
              in: "query",
              schema: {
                type: "number",
                default: 1,
              },
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "number",
                default: 20,
              },
            },
            {
              name: "sortBy",
              in: "query",
              schema: {
                type: "string",
                default: "createdAt",
              },
            },
            {
              name: "orderBy",
              in: "query",
              schema: {
                type: "string",
                default: "desc",
              },
            },
          ],
          responses: {
            200: {
              description: "Users retrieved successfully",
              schema: successSchema("User retrieved successfully.", {
                total: { type: "number", example: 100 },
                hasMore: { type: "boolean", example: true },
                page: { type: "number", example: 1 },
                limit: { type: "number", example: 20 },
                totalPages: { type: "number", example: 5 },
                users: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "user-uuid" },
                      email: { type: "string", example: "user@test.com" },
                      firstName: { type: "string", example: "John" },
                      lastName: { type: "string", example: "Doe" },
                      accountActive: { type: "boolean", example: true },
                      groups: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "group-uuid" },
                            name: { type: "string", example: "Admin" },
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

      put: {
        config: {
          summary: "Update own profile",
          description: "Update logged-in user's profile",
          body: {
            properties: {
              firstName: { type: "string", nullable: true, example: "John" },
              lastName: { type: "string", nullable: true, example: "Doe" },
              profileImageUrl: {
                type: "string",
                nullable: true,
                example: "https://example.com/image.jpg",
              },
            },
          },
          responses: {
            200: {
              description: "Profile updated successfully",
              schema: successSchema("User details updated successfully", {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    email: { type: "string" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    profileImageUrl: { type: "string", nullable: true },
                  },
                },
              }),
            },
            403: { description: "Account disabled" },
            404: { description: "User not found" },
          },
        },
        secure: true,
      },
    },
    ["Users"],
  ),

  /**
   * PUT /api/v1/users/{userId}/profile (Admin)
   */
  ...createAuthPut(
    `${BASE_URL}/{userId}/profile`,
    {
      summary: "Update user profile (Admin)",
      description: "Admin updates another user's profile",
      params: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      body: {
        properties: {
          firstName: { type: "string", nullable: true, example: "Jane" },
          lastName: { type: "string", nullable: true, example: "Smith" },
          profileImageUrl: {
            type: "string",
            nullable: true,
            example: "https://example.com/pfp.png",
          },
        },
      },
      responses: {
        200: {
          description: "User profile updated successfully",
          schema: successSchema("User profile updated successfully", {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                profileImageUrl: { type: "string", nullable: true },
              },
            },
          }),
        },
        404: { description: "User not found" },
      },
    },
    true,
    ["Users"],
  ),

  /**
   * DELETE /api/v1/users/{userId}
   */
  ...createAuthDelete(
    `${BASE_URL}/{userId}`,
    {
      summary: "Soft delete user",
      description: "Soft deletes user and revokes refresh tokens",
      params: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "User deleted successfully",
          schema: successSchema("Account deleted successfully"),
        },
        404: { description: "User not found or already deleted" },
      },
    },
    true,
    ["Users"],
  ),

  /**
   * PATCH /api/v1/users/{userId}/restore
   */
  ...createAuthPatch(
    `${BASE_URL}/{userId}/restore`,
    {
      summary: "Restore deleted user",
      description: "Restore a soft-deleted user",
      params: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "User restored successfully",
          schema: successSchema("User restored successfully", {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                accountActive: { type: "boolean" },
              },
            },
          }),
        },
        400: { description: "User is not deleted" },
        404: { description: "User not found" },
      },
    },
    true,
    ["Users"],
  ),

  /**
   * PATCH /api/v1/users/{userId}/status
   */
  ...createAuthPatch(
    `${BASE_URL}/{userId}/status`,
    {
      summary: "Update user account status",
      description: "Activate or deactivate user account",
      params: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      body: {
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
        },
      },
      responses: {
        200: {
          description: "User status updated successfully",
          schema: successSchema("User status updated successfully"),
        },
        404: { description: "User not found" },
      },
    },
    true,
    ["Users"],
  ),

  /**
   * PUT /api/v1/users/{userId}/groups (Admin)
   */
  ...createAuthPut(
    `${BASE_URL}/{userId}/groups`,
    {
      summary: "Assign groups to a user (Admin)",
      description: "Assign one or more groups to a user. Existing group mappings will be replaced.",
      params: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      body: {
        required: ["groups"],
        properties: {
          groups: {
            type: "array",
            items: { type: "string" },
            example: ["group-uuid-1", "group-uuid-2"],
          },
        },
      },
      responses: {
        200: {
          description: "Groups assigned to user successfully",
          schema: successSchema("Groups assigned to user successfully"),
        },
        400: { description: "Invalid request (no groups provided or invalid group IDs)" },
        404: { description: "User not found" },
      },
    },
    true,
    ["Users", "Groups"],
  ),
};
