import fs from "fs";

export const createFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Created: ${folderPath}`);
  }
};

export const createFile = (filePath: string, content: string = "") => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`📄 Created: ${filePath}`);
  }
};
