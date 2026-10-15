#!/usr/bin/env node

import path from "path";
import { createFile, createFolder } from "./helpers/create.helper.ts";
import { setupDBForModule } from "./helpers/dbSetup.helper.ts";

const args = process.argv.slice(2);
const moduleName = args[0];
const shouldSetupDB = args.includes("--setup-db");

if (!moduleName) {
  console.error("[Error]: Please provide a module name");
  process.exit(1);
}

const basePath = path.join(process.cwd(), "src/modules", moduleName);

const folders = [
  "controllers",
  "routes",
  "services",
  "validations",
  "middlewares",
  "swagger",
  "types",
  "utils",
];

// Create module root
createFolder(basePath);

// Create all folders
folders.forEach((folder) => {
  createFolder(path.join(basePath, folder));
});

// Boilerplate Files

// index.ts
createFile(path.join(basePath, "index.ts"), `// Module Exports";\n`);

// controller
createFile(
  path.join(basePath, "controllers", `${moduleName}.controller.ts`),
  `export const get${capitalize(moduleName)} = async (req, res) => {
  res.json({ message: "${moduleName} works!" });
};\n`,
);

createFile(path.join(basePath, "controllers", "index.ts"), `// Controllers exports\n`);

// -----------------------

// service
createFile(
  path.join(basePath, "services", `${moduleName}.service.ts`),
  `export const get${capitalize(moduleName)}Service = async () => {
  return "${moduleName} service working";
};\n`,
);

createFile(path.join(basePath, "services", "index.ts"), `// Services exports\n`);

// -----------------------

// route
createFile(
  path.join(basePath, "routes", `${moduleName}.route.ts`),
  `import { Router } from "express";
import { get${capitalize(moduleName)} } from "../controllers/${moduleName}.controller.js";

const router = Router();

router.get("/", get${capitalize(moduleName)});

export default router;\n`,
);

// routes index
createFile(path.join(basePath, "routes", "index.ts"), `// Routes exports\n`);

// -----------------------

// Middleware files
createFile(
  path.join(basePath, "middlewares", "validateAuthentication.ts"),
  `
import { validateAuthentication } from "../../../shared/middlewares/validateAuthentication.js";
export { validateAuthentication };
`,
);

createFile(
  path.join(basePath, "middlewares", "validateAuthorization.ts"),
  `
import { validateAuthorization } from "../../../shared/middlewares/validateAuthorization.js";
export { validateAuthorization };
`,
);

createFile(
  path.join(basePath, "middlewares", "validateResource.ts"),
  `
import { validateResource } from "../../../shared/middlewares/validateResource.js";
export { validateResource };
`,
);

// -----------------------

// Validation
createFile(
  path.join(basePath, "validations", `${moduleName}.schema.ts`),
  `// Validation schema for ${moduleName}\n`,
);
createFile(path.join(basePath, "validations", `index.ts`), `// Validation exports`);

// -----------------------
// Swagger
createFile(
  path.join(basePath, "swagger", `${moduleName}.swagger.ts`),
  `// Swagger docs for ${moduleName}\n`,
);
createFile(path.join(basePath, "swagger", `index.ts`), `// Swagger exports`);

// Setup DB
if (shouldSetupDB) {
  setupDBForModule(basePath, moduleName);
}

// helper
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

console.log(`\n✅ Module "${moduleName}" created successfully!\n`);
