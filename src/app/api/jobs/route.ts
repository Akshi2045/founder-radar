
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
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.crustdata.com/job/search",
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
                field: "company.basic_info.company_id",
                type: "=",
                value: companyId,
              },
            ],
          },
          limit: 5,
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Job search failed." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      jobs: data.job_listings || [],
      total: data.total_count || 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch job listings." },
      { status: 500 }
    );
  }
}

