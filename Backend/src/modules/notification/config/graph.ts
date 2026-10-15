import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

export const graphClient = () => {
  const client_id=  process.env.AZURE_CLIENT_ID;
  const secret_value = process.env.AZURE_SECRET_VALUE;
  const tenant_id = process.env.AZURE_TENANT_ID;
  const MICROSOFT_GRAPH_URL = process.env.MICROSOFT_GRAPH_URL;

  if(!client_id || !secret_value || !tenant_id || !MICROSOFT_GRAPH_URL) {
    throw new Error("Graph Client configuration not found");
  }

  let credential = null;

  try {
    credential = new ClientSecretCredential(
      tenant_id,
      client_id,
      secret_value,
    );
    
  } catch(error) {
    console.log("[Error] : Failed to create Graph credentials.", error);
    throw new Error("Failed to create Graph credentials.");
  }

  if(!credential) {
    throw new Error("Failed to get Graph credentials.")
  }

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken(MICROSOFT_GRAPH_URL);
        return token!.token;
      },
    },
  });
};
