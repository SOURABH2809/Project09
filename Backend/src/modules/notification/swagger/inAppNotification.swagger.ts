import { createAuthEndpoint } from "./factory.js";

const BASE_URL = "/api/v1/notifications/in-app";

export const inAppNotificationSwagger = {
  /**
   * PATCH /read
   */
  ...createAuthEndpoint(
    `${BASE_URL}/read`,
    {
      patch: {
        config: {
          summary: "Mark notifications as read",
          description: "Mark specific in-app notifications as read",
          body: {
            required: ["notificationIds"],
            properties: {
              notificationIds: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
          responses: {
            200: { description: "Notifications marked as read successfully" },
            404: { description: "Notification not found" },
          },
        },
        secure: true,
      },
    },
    ["In-App Notifications"],
  ),

  /**
   * PATCH /unread
   */
  ...createAuthEndpoint(
    `${BASE_URL}/unread`,
    {
      patch: {
        config: {
          summary: "Mark notifications as unread",
          description: "Mark specific in-app notifications as unread",
          body: {
            required: ["notificationIds"],
            properties: {
              notificationIds: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
          responses: {
            200: { description: "Notifications marked as unread successfully" },
          },
        },
        secure: true,
      },
    },
    ["In-App Notifications"],
  ),

  /**
   * PATCH /read-all
   */
  ...createAuthEndpoint(
    `${BASE_URL}/read-all`,
    {
      patch: {
        config: {
          summary: "Mark all notifications as read",
          description: "Mark all in-app notifications as read for the user",
          responses: {
            200: { description: "All notifications marked as read successfully" },
          },
        },
        secure: true,
      },
    },
    ["In-App Notifications"],
  ),

  /**
   * PATCH /unread-all
   */
  ...createAuthEndpoint(
    `${BASE_URL}/unread-all`,
    {
      patch: {
        config: {
          summary: "Mark all notifications as unread",
          description: "Mark all in-app notifications as unread for the user",
          responses: {
            200: { description: "All notifications marked as unread successfully" },
          },
        },
        secure: true,
      },
    },
    ["In-App Notifications"],
  ),

  /**
   * DELETE /
   */
  ...createAuthEndpoint(
    BASE_URL,
    {
      delete: {
        config: {
          summary: "Delete notifications",
          description: "Soft delete specific in-app notifications",
          body: {
            required: ["notificationIds"],
            properties: {
              notificationIds: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
          responses: {
            200: { description: "Notifications deleted successfully" },
          },
        },
        secure: true,
      },
      get: {
        config: {
          summary: "Get in-app notifications",
          description:
            "Retrieve in-app notifications for the logged-in user with filters, sorting, and pagination",
          queryParams: [
            { name: "page", in: "query", schema: { type: "number", default: 1 } },
            { name: "limit", in: "query", schema: { type: "number", default: 50 } },
            {
              name: "isRead",
              in: "query",
              schema: { type: "boolean" },
            },
            {
              name: "severity",
              in: "query",
              schema: {
                type: "string",
                enum: ["INFO", "WARNING", "ERROR"],
              },
            },
            {
              name: "type",
              in: "query",
              schema: {
                type: "string",
                enum: ["SYSTEM", "BUSINESS", "SECURITY", "BILLING"],
              },
            },
            {
              name: "title",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "orderBy",
              in: "query",
              schema: {
                type: "string",
                enum: ["asc", "desc"],
                default: "asc",
              },
            },
          ],
          responses: {
            200: { description: "In-app notifications retrieved successfully" },
            401: { description: "Unauthorized" },
          },
        },
        secure: true,
      },
    },
    ["In-App Notifications"],
  ),

  /**
   * PATCH /restore
   */
  ...createAuthEndpoint(
    `${BASE_URL}/restore`,
    {
      patch: {
        config: {
          summary: "Restore notifications",
          description: "Restore soft-deleted in-app notifications",
          body: {
            required: ["notificationIds"],
            properties: {
              notificationIds: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
          responses: {
            200: { description: "Notifications restored successfully" },
          },
        },
        secure: true,
      },
    },
    ["In-App Notifications"],
  ),
};
