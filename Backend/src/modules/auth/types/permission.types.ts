export type PermissionAction = {
  id: string;
  name: string;
  normalizedName: string;
  action: string;
  description: string | null;
};

export type SubFeature = {
  subFeatureKey: string;
  subFeatureName?: string | null;
  actions: PermissionAction[];
};

export type Page = {
  pageKey: string;
  pageName: string;
  resource: string;
  actions: PermissionAction[];
  subFeatures: SubFeature[];
};

export type Module = {
  moduleKey: string;
  moduleName: string;
  pages: Page[];
};
