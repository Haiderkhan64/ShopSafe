import { defineLive } from "next-sanity/live";
import { client } from "./client";


export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: "vX",
  }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  fetchOptions: {
    revalidate: 0,
  },
});