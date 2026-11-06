import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.CRUSTDATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Crustdata API key is missing." },
      { status: 500 }
    );
  }

  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.crustdata.com/person/search",
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
                field: "experience.employment_details.current.name",
                type: "(.)",
                value: companyName,
              },
            ],
          },
          limit: 20,
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "People search failed." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      profiles: data.profiles || [],
      total: data.total_count || 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch contacting persons." },
      { status: 500 }
    );
  }
}