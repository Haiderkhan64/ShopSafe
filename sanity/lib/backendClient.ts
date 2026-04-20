import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // NEVER true for a write client — writes need fresh reads
  token: process.env.SANITY_API_TOKEN,
});