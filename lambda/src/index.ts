import type { Handler } from "aws-lambda";
import { z } from "zod";

const NATIONALIZE_API_URL = "https://api.nationalize.io/";

const NationalizeResponseSchema = z.object({
  count: z.number(),
  name: z.string(),
  country: z.array(
    z.object({ country_id: z.string(), probability: z.number() }),
  ),
});

export const handler: Handler = async (event) => {
  const name = event?.name ?? "ana";
  const url = new URL(NATIONALIZE_API_URL);
  url.searchParams.set("name", name);
  console.log(`Fetching data from: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch data from Nationalize API: ${response.statusText}`,
    );
  }
  const data = NationalizeResponseSchema.parse(await response.json());
  console.log(data);
  return { name, countries: data.country };
};

// @ts-expect-error: Fake event
await handler({ event: { name: "ana" } });
