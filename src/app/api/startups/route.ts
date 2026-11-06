import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.CRUSTDATA_API_KEY;
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry") || "Artificial Intelligence";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Crustdata API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.crustdata.com/company/search",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "x-api-version": "2025-11-01",
        },
        body: JSON.stringify({
          filters: {
            op: "and",
            conditions: [
              {
                field: "locations.country",
                type: "=",
                value: "India",
              },
              {
                field: "taxonomy.professional_network_industry",
                type: "=",
                value: industry,
              },
            ],
          },
          fields: [
            "basic_info.name",
            "basic_info.primary_domain",
            "headcount.total",
            "headcount.growth_percent",
          ],
          limit: 10,
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Crustdata request failed." },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to Crustdata." },
      { status: 500 }
    );
  }
}