import path from "path";

export const VOIPED_LOGO_URL = `${process.env.BASE_URL}/public/voiped-red-black-logo.png`;
export const QUEUE = process.env.EMAIL_QUEUE_NAME ?? "email_queue";
export const IN_APP_NOTIFICATIONS_QUEUE =
  process.env.IN_APP_NOTIFICATIONS_QUEUE_NAME ?? "in-app-notifications";
export const PASSWORD_EXPIRY_DURATION_MS =
  Number(process.env.PASSWORD_EXPIRY_MS) || 365 * 24 * 60 * 60 * 1000;

export const publicAssetsPath = path.join(process.cwd(), "public/assets");
export const PERMISSION_WILD_CARD = "all";
export const USER_PERMISSION_CACHE_TTL =
  Number(process.env.USER_PERMISSION_CACHE_TTL) || 60 * 60 * 24;

// System Group Name
export const FINANCE_USER_GROUP_NAME = "Finance";
export const SALES_USER_GROUP_NAME = "Sales";
export const SUPPLIER_GROUP_NAME = "Supplier";
export const CUSTOMER_GROUP_NAME = "Customer";

export const CUSTOMER_ADMIN_GROUP_NAME = "Customer_Admin";
export const CUSTOMER_SUPER_ADMIN_GROUP_NAME = "Customer_Super_Admin";
export const CUSTOMER_USER_GROUP_NAME = "Customer_User";
