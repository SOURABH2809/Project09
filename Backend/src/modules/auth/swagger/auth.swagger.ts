import { createAuthPost, createAuthGet, createAuthPut, successSchema } from "./factory.js";

const BASE_URL = "/api/v1/auth";

export const authSwagger = {
  /* ---------------------------------------------------------------------
     SIGN UP
  --------------------------------------------------------------------- */
  ...createAuthPost(`${BASE_URL}/signup`, {
    summary: "Register a new user",
    description: "Creates a new user account and associates it with a customer",
    body: {
      required: ["email", "firstName", "lastName"],
      properties: {
        email: { type: "string", format: "email", example: "user@test.com" },
        firstName: { type: "string", example: "John" },
        lastName: { type: "string", example: "Doe" },
        customerId: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
        customerName: { type: "string", example: "Voiped Pvt Ltd" },
        profileImage: { type: "string", nullable: true },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
        schema: successSchema("User created successfully."),
      },
      409: { description: "Email already exists" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
    },
  }),

  /* ---------------------------------------------------------------------
     SIGN IN
  --------------------------------------------------------------------- */
  ...createAuthPost(`${BASE_URL}/signin`, {
    summary: "Sign in user",
    description: "Authenticates user credentials and returns access and refresh tokens",
    body: {
      required: ["email", "password"],
      properties: {
        email: { type: "string", example: "user@test.com" },
        password: { type: "string", example: "NewPass@123" },
      },
    },
    responses: {
      200: {
        description: "Login successful",
        schema: {
          oneOf: [
            successSchema(
              "User logged in successfully",
              {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "user-uuid-123" },
                    email: { type: "string", example: "user@test.com" },
                    firstName: { type: "string", example: "John" },
                    lastName: { type: "string", example: "Doe" },
                    permissions: {
                      type: "array",
                      items: { type: "string" },
                      example: ["user:edit", "user:create"],
                    },
                  },
                },
              },
              {
                accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
              },
            ),
          ],
        },
      },
      401: { description: "Invalid credentials" },
      403: { description: "Account disabled or password reset required" },
      423: { description: "Account temporarily locked" },
    },
  }),

  /* ---------------------------------------------------------------------
     REFRESH TOKEN
  --------------------------------------------------------------------- */
  ...createAuthPost(`${BASE_URL}/refresh`, {
    summary: "Refresh access token",
    description: "Rotates refresh token and issues new access token",
    responses: {
      200: {
        description: "Token refreshed successfully",
        schema: successSchema("Token Refreshed.", {
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        }),
      },
      401: { description: "Unauthorized or token revoked" },
    },
  }),

  /* ---------------------------------------------------------------------
     LOGOUT
  --------------------------------------------------------------------- */
  ...createAuthPost(
    `${BASE_URL}/logout`,
    {
      summary: "Logout user",
      description: "Revokes refresh token and clears session",
      responses: {
        200: {
          description: "Logged out successfully",
          schema: successSchema("Logged out successfully"),
        },
        401: { description: "Unauthorized" },
      },
    },
    true,
  ),

  /* ---------------------------------------------------------------------
     GET CURRENT USER
  --------------------------------------------------------------------- */
  ...createAuthGet(
    `${BASE_URL}/me`,
    {
      summary: "Get current user details",
      responses: {
        200: {
          description: "User details retrieved successfully",
          schema: successSchema("User details retrieved successfully", {
            user: {
              type: "object",
              properties: {
                id: { type: "string", example: "user-uuid-123" },
                email: { type: "string", example: "user@test.com" },
                firstName: { type: "string", example: "John" },
                lastName: { type: "string", example: "Doe" },
                accountActive: { type: "boolean", example: true },
                twoFactorEnabled: { type: "boolean", example: false },
                permissions: {
                  type: "array",
                  items: { type: "string" },
                  example: ["READ_USER", "EDIT_USER"],
                },
              },
            },
          }),
        },
        401: { description: "Unauthorized" },
        404: { description: "User not found" },
      },
    },
    true,
  ),

  /* ---------------------------------------------------------------------
     CHECK EXISTING ACCOUNT
  --------------------------------------------------------------------- */
  ...createAuthPost(
    `${BASE_URL}/check-existing-account`,
    {
      summary: "Check existing account by email",
      description:
        "Used on blur during customer or customer-user creation to classify the email as internal user, existing customer user, or new user.",
      body: {
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "customer.user@test.com",
          },
        },
      },
      responses: {
        200: {
          description: "Existing account check completed successfully",
          schema: successSchema("Existing account check completed successfully", {
            account: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "customer.user@test.com",
                },
                status: {
                  type: "string",
                  enum: ["no_user_exists", "customer_user_exists", "internal_user_exists"],
                  example: "customer_user_exists",
                },
                message: {
                  type: "string",
                  example:
                    "Primary email is already registered. Do you want to proceed with the existing account?",
                },
                user: {
                  nullable: true,
                  oneOf: [
                    { type: "null" },
                    {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        email: { type: "string", format: "email" },
                        firstName: { type: "string", example: "John" },
                        lastName: { type: "string", example: "Doe" },
                        userType: {
                          type: "string",
                          enum: ["CUSTOMER", "INTERNAL"],
                          example: "CUSTOMER",
                        },
                      },
                    },
                  ],
                },
              },
            },
          }),
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
      },
    },
    true,
  ),

  /* ---------------------------------------------------------------------
     FORGOT PASSWORD
  --------------------------------------------------------------------- */
  ...createAuthPost(`${BASE_URL}/forgot-password`, {
    summary: "Forgot password",
    body: {
      required: ["email"],
      properties: {
        email: { type: "string", example: "user@test.com" },
      },
    },
    responses: {
      200: {
        description: "If the email exists, a reset token has been generated",
        schema: successSchema("If the email exists, a reset token has been generated"),
      },
    },
  }),

  /* ---------------------------------------------------------------------
     RESET PASSWORD
  --------------------------------------------------------------------- */
  ...createAuthPost(`${BASE_URL}/reset-password`, {
    summary: "Reset password",
    body: {
      required: ["token", "password", "confirmPassword"],
      properties: {
        token: { type: "string", example: "reset-token-123" },
        password: { type: "string", example: "NewPass@123" },
        confirmPassword: { type: "string", example: "NewPass@123" },
      },
    },
    responses: {
      200: {
        description: "Password reset successfully",
        schema: successSchema("Password reset successfully"),
      },
      400: { description: "Invalid or expired reset token" },
    },
  }),

  /* ---------------------------------------------------------------------
     CHANGE PASSWORD
  --------------------------------------------------------------------- */
  ...createAuthPut(
    `${BASE_URL}/change-password`,
    {
      summary: "Change password",
      description: "Changes the authenticated user's password",
      body: {
        required: ["oldPassword", "newPassword", "confirmNewPassword"],
        properties: {
          oldPassword: { type: "string", example: "OldPass@123" },
          newPassword: { type: "string", example: "NewPass@123" },
          confirmNewPassword: { type: "string", example: "NewPass@123" },
        },
      },
      responses: {
        200: {
          description: "Password changed successfully",
          schema: successSchema("Password changed successfully"),
        },
        400: { description: "Incorrect current password / Invalid new password" },
        401: { description: "Unauthorized" },
      },
    },
    true, // Requires authentication
  ),
};
