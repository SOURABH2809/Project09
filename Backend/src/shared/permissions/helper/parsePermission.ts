
export type PermissionMeta = {
  resourceKey: string;
  resourceName: string;

  subFeatureKey?: string;
  subFeatureName?: string;

  pageKey: string;
  pageName: string;

  subPageKey?: string;
  subPageName?: string;

  action: string;
  description: string;
  name: string;
  moduleName: string;
};

// feature:subFeature:action

export function parsePermission(
  permission: string,
  moduleName: string,
  pageName: string,
): PermissionMeta {
  const hasSubFeature = permission.split(":").length > 2;
  const action = permission.split(":").slice(-1)[0];
  const featurePart = permission.split(":")[0];
  const subFeaturePart = hasSubFeature ? permission.split(":")[1] : undefined;

  const description = generatePermissionDescription({
    permission,
    action,
    pageName,
    subFeatureName: subFeaturePart,
    resourceName: featurePart.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
  });

  // detect sub-page (contacts, network-config, draft etc)
  if (subFeaturePart) {
    return {
      resourceKey: featurePart,
      resourceName: featurePart.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),

      pageKey: pageName,
      pageName: pageName.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),

      subFeatureKey: subFeaturePart,
      subFeatureName: subFeaturePart
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),

      action,
      description,
      name: permission,
      moduleName,
    };
  }

  return {
    resourceKey: featurePart,
    resourceName: featurePart.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),

    pageKey: pageName,
    pageName: pageName,

    subFeatureKey: undefined,
    subFeatureName: undefined,

    action,
    description,
    name: permission,
    moduleName,
  };
}

function generatePermissionDescription({
  permission,
  action,
  pageName,
  subFeatureName,
  resourceName,
}: {
  permission: string;
  action: string;
  pageName: string;
  subFeatureName?: string;
  resourceName: string;
}) {
  const toReadable = (value: string) =>
    value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const readablePage = toReadable(pageName);
  const resource = resourceName.replace(/-/g, " ");

  const actionPhrase = formatActionPhrase(action, resource);

  if (subFeatureName) {
    return `Allows user to ${actionPhrase} in the ${toReadable(subFeatureName)} section on the ${readablePage} page.`;
  }

  return `Allows user to ${actionPhrase} on the ${readablePage} page.`;
}

function formatActionPhrase(action: string, resource: string) {
  const readable = action.replace(/-/g, " ");

  switch (true) {
    case action.includes("assign"):
      return `assign ${readable.replace("assign", "").trim()} to ${resource}`;
    case action.includes("update-status"):
      return `update the status of ${resource}`;
    case action === "read":
      return `view ${resource}`;
    case action === "all":
      return `perform all actions on ${resource}`;
  }

  return `${readable} ${resource}`;
}
