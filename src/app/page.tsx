
"use client";

import { useEffect, useState } from "react";

type Company = {
  crustdata_company_id: number;
  basic_info?: {
    name?: string;
    primary_domain?: string;
  };
  headcount?: {
    total?: number;
    growth_percent?: {
      "6m"?: number;
    };
  };
};
type Job = {
  job_details?: {
    title?: string;
    category?: string;
    url?: string;
    workplace_type?: string;
  };
};
type Person = {
  crustdata_person_id?: number;
  basic_profile?: {
    name?: string;
    headline?: string;
  };
  experience?: {
    employment_details?: {
      current?: {
        name?: string;
        title?: string;
      }[];
    };
  };
  social_handles?: {
    professional_network_identifier?: {
      profile_url?: string;
    };
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const value = error as { message?: unknown; error?: unknown };
    if (typeof value.message === "string") return value.message;
    if (typeof value.error === "string") return value.error;
  }
  return fallback;
}

export default function Home() {
  const [query, setQuery] = useState("AI startups in India");
  const [interest, setInterest] = useState("Artificial Intelligence");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [savedCompanies, setSavedCompanies] = useState<Company[]>([]);
  const [savedSearch, setSavedSearch] = useState("");
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [jobResults, setJobResults] = useState<Record<number, Job[]>>({});
const [jobLoading, setJobLoading] = useState<number | null>(null);
const [jobErrors, setJobErrors] = useState<Record<number, string>>({});
const [peopleResults, setPeopleResults] = useState<Record<number, Person[]>>({});
const [peopleLoading, setPeopleLoading] = useState<number | null>(null);
const [peopleErrors, setPeopleErrors] = useState<Record<number, string>>({});
const [outreachDrafts, setOutreachDrafts] = useState<Record<number, string>>({});
  useEffect(() => {
  const stored =
    localStorage.getItem("founderradar-saved-v2") ||
    localStorage.getItem("founderradar-saved");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setSavedCompanies(parsed);
      }
    } catch {
      console.error("Could not load saved startups");
    }
  }

  setSavedLoaded(true);
}, []);

useEffect(() => {
  if (!savedLoaded) return;

  localStorage.setItem(
    "founderradar-saved-v2",
    JSON.stringify(savedCompanies)
  );
}, [savedCompanies, savedLoaded]);

  async function discoverOpportunities() {
    setLoading(true);
    setError("");
    setSearched(false);
    setCompanies([]);

    try {
      const response = await fetch(
  `/api/startups?industry=${encodeURIComponent(interest)}`
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data.error, "Unable to fetch companies."));
      }

      setCompanies(data.companies || []);
      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function checkHiringSignals(companyId: number) {
  setJobLoading(companyId);
  setJobErrors((prev) => ({ ...prev, [companyId]: "" }));

  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(data.error, "Job search failed."));
    }

    setJobResults((prev) => ({
      ...prev,
      [companyId]: data.jobs || [],
    }));
  } catch (err) {
    setJobErrors((prev) => ({
      ...prev,
      [companyId]:
        err instanceof Error ? err.message : "Unable to check jobs.",
    }));
  } finally {
    setJobLoading(null);
  }
}

function generateOutreach(person: Person, companyName: string) {
  const name = person.basic_profile?.name?.trim();
  const role = person.basic_profile?.headline || "your professional work";

  const greeting = name
    ? `Hello ${name},`
    : "Dear Sir/Madam,";

  const message = `${greeting}

I hope you are doing well.

I recently came across ${companyName} and was interested in learning more about the work your team is doing. Your professional experience as ${role} particularly caught my attention.

I am a student with a strong interest in this domain and would appreciate the opportunity to explore potential internship or collaboration opportunities at ${companyName}.

I would be glad to share my resume and provide further details about my background and skills.

Thank you for your time and consideration.

Best regards`;

  setOutreachDrafts((prev) => ({
    ...prev,
    [person.crustdata_person_id]: message,
  }));
}

function getContactPriority(person: Person) {
  const title = [
    person.basic_profile?.headline,
    person.experience?.employment_details?.current?.[0]?.title,
  ]
    .join(" ")
    .toLowerCase();

  if (title.includes("founder")) return 1;
  if (title.includes("chief executive") || /\bceo\b/.test(title)) return 2;
  if (title.includes("chief technology") || /\bcto\b/.test(title)) return 3;
  if (title.includes("managing director")) return 4;
  if (title.includes("head of engineering")) return 5;

  return 10;
}
async function findContactingPersons(companyId: number, companyName: string) {
  setPeopleLoading(companyId);
  setPeopleErrors((prev) => ({ ...prev, [companyId]: "" }));

  try {
    const response = await fetch("/api/contacting-persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(data.error, "People search failed."));
    }

    setPeopleResults((prev) => ({
      ...prev,
      [companyId]: data.profiles || [],
    }));
  } catch (err) {
    setPeopleErrors((prev) => ({
      ...prev,
      [companyId]:
        err instanceof Error ? err.message : "Unable to find contacts.",
    }));
  } finally {
    setPeopleLoading(null);
  }
}

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0c1322] p-6 md:flex md:flex-col">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-bold text-slate-950">
              F
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                FounderRadar
              </h1>
              <p className="text-xs text-slate-500">
                Opportunity intelligence
              </p>
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2 text-sm">
            <div className="rounded-xl bg-cyan-400/10 px-4 py-3 font-medium text-cyan-300">
              ◈ Dashboard
            </div>
            <div className="rounded-xl px-4 py-3 text-slate-400">
              ⌕ Discover startups
            </div>
            <div className="rounded-xl px-4 py-3 text-slate-400">
              ☆ Saved opportunities
            </div>
            <div className="rounded-xl px-4 py-3 text-slate-400">
              ◷ Activity monitor
            </div>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold">
              Your opportunity radar
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Discover companies, understand their growth and find your next opportunity.
            </p>
            <div className="mt-4 h-1.5 rounded-full bg-slate-700">
              <div className="h-1.5 w-3/4 rounded-full bg-cyan-400" />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Profile setup · 75%
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-8 md:px-10">
          <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Workspace / Dashboard
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Opportunity dashboard
              </h2>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
              Student workspace
            </div>
          </header>

          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-cyan-300">
              YOUR NEXT OPPORTUNITY STARTS HERE
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
              Find opportunities{" "}
              <span className="text-cyan-400">
                before they become vacancies.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              Discover Indian startups, review growth and hiring signals, and identify relevant people to approach.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-[#111b2d] p-5 md:p-6">
            <label className="mb-3 block text-sm font-semibold">
              Choose the startup domain you want to explore
            </label>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#080d18] p-4 text-sm outline-none transition focus:border-cyan-400"
              placeholder="Example: AI startups in India, early-stage fintech companies, or climate-tech teams..."
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#080d18] px-3 py-2 text-sm text-slate-300 outline-none"
              >
                <option>Artificial Intelligence</option>
                <option>Software Development</option>
                <option>Space Research and Technology</option>
<option>Climate Technology Product Manufacturing</option>
<option>Climate Data and Analytics</option>
              </select>

              <button
                onClick={discoverOpportunities}
                disabled={loading}
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Discovering..." : "Discover opportunities →"}
              </button>
            </div>

            {loading && (
              <p className="mt-4 text-sm text-cyan-300">
                Searching Crustdata for Indian companies in this domain...
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Your opportunity overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Live company data from Crustdata
              </p>
            </div>
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
              Live data
            </span>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              [String(companies.length), "Companies returned"],
              [
                String(companies.filter((c) => (c.headcount?.growth_percent?.["6m"] ?? 0) > 0).length),
                "Growing companies",
              ],
              [
                String(companies.reduce((sum, c) => sum + (c.headcount?.total ?? 0), 0)),
                "Combined employees",
              ],
            ].map(([number, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-[#111b2d] p-5"
              >
                <p className="text-3xl font-bold">{number}</p>
                <p className="mt-2 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Companies matching growth signals
            </h3>
            <span className="text-xs text-slate-500">
              {companies.length} results
            </span>
          </div>

          <div className="space-y-3">
            {!searched && !loading && (
              <div className="rounded-2xl border border-white/10 bg-[#111b2d] p-8 text-center">
                <p className="font-semibold text-slate-300">
                  Your next opportunity is waiting.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Click Discover opportunities to fetch real company data.
                </p>
              </div>
            )}

            {searched && companies.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#111b2d] p-8 text-center text-slate-400">
                No companies were returned. Try again later.
              </div>
            )}

            {[...companies]
  .sort(
    (a, b) =>
      (b.headcount?.growth_percent?.["6m"] ?? 0) -
      (a.headcount?.growth_percent?.["6m"] ?? 0)
  )
  .map((company) => {
              const name = company.basic_info?.name || "Unknown company";
              const domain = company.basic_info?.primary_domain || "Domain unavailable";
              const employees = company.headcount?.total ?? "Not available";
              const growth = company.headcount?.growth_percent?.["6m"];
              // FounderRadar's experimental fit score (not an official Crustdata score).
              const growthScore =
                growth === undefined || growth <= 0
                  ? 0
                  : growth < 5
                    ? 10
                    : growth < 10
                      ? 20
                      : growth < 20
                        ? 30
                        : 40;

              const jobListings = jobResults[company.crustdata_company_id];
              const hiringScore = jobListings
                ? Math.min(30, jobListings.length * 10)
                : 0;

              const employeeCount = company.headcount?.total ?? 0;
              const companyScaleScore =
                employeeCount >= 1000
                  ? 15
                  : employeeCount >= 500
                    ? 12
                    : employeeCount >= 100
                      ? 9
                      : employeeCount >= 20
                        ? 6
                        : employeeCount > 0
                          ? 3
                          : 0;

              const peopleFound = peopleResults[company.crustdata_company_id];
              const contactScore = peopleFound
                ? peopleFound.length > 0 ? 15 : 0
                : 0;

              const opportunityScore =
                growthScore + hiringScore + companyScaleScore + contactScore;

              return (
                <div
                  key={company.crustdata_company_id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111b2d] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-lg font-bold text-cyan-300">
                      {name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h4 className="font-semibold">
  <a
    href={`https://${domain}`}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-cyan-400 transition"
  >
    {name} ↗
  </a>
</h4>
                      <p className="mt-1 text-xs text-slate-400">
                        {domain}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {employees} employees
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xl font-bold text-cyan-300">
                      {growth !== undefined
                        ? `${growth.toFixed(1)}%`
                        : "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">
                      6-month headcount growth
                    </p>
                    <button
  onClick={() =>
    setSavedCompanies((prev) =>
      prev.some(
        (c) => c.crustdata_company_id === company.crustdata_company_id
      )
        ? prev.filter(
            (c) => c.crustdata_company_id !== company.crustdata_company_id
          )
        : [...prev, company]
    )
  }
  className="mt-3 rounded-lg border border-cyan-400/30 px-3 py-1 text-xs text-cyan-300 hover:bg-cyan-400/10"
>
  {savedCompanies.some(
    (c) => c.crustdata_company_id === company.crustdata_company_id
  )
    ? "★ Saved"
    : "☆ Save startup"}
</button>
                    <div className="mt-3 text-right">
  <p className="text-sm font-semibold text-emerald-400">
    {opportunityScore}/100 Opportunity Fit Score
  </p>
  <p className="mt-1 text-xs text-slate-400">
    Growth: {growthScore}/40 · Hiring: {jobListings ? `${hiringScore}/30` : "Not checked"}
  </p>
  <p className="mt-1 text-xs text-slate-500">
    Scale: {companyScaleScore}/15 · Contacts: {peopleFound ? `${contactScore}/15` : "Not checked"}
  </p>
  <p className="mt-1 text-[10px] text-slate-500">
    Experimental score based on available signals; not a hiring prediction.
  </p>
</div>
<button
  onClick={() => checkHiringSignals(company.crustdata_company_id)}
  disabled={jobLoading === company.crustdata_company_id}
  className="mt-3 rounded-lg border border-violet-400/30 px-3 py-2 text-xs text-violet-300 disabled:opacity-50"
>
  {jobLoading === company.crustdata_company_id
    ? "Checking..."
    : "Check Hiring Signals"}
</button>

<button
  onClick={() =>
    findContactingPersons(
      company.crustdata_company_id,
      name
    )
  }
  disabled={peopleLoading === company.crustdata_company_id}
  className="mt-3 rounded-lg border border-cyan-400/30 px-3 py-2 text-xs text-cyan-300 disabled:opacity-50"
>
  {peopleLoading === company.crustdata_company_id
    ? "Finding people..."
    : "Find Contacting Persons"}
</button>

{peopleResults[company.crustdata_company_id] && (
  <div className="mt-3 rounded-lg border border-white/10 p-3 text-left">
    <p className="text-xs font-semibold text-cyan-300">
      {peopleResults[company.crustdata_company_id].length} people found
    </p>

    {[...peopleResults[company.crustdata_company_id]]
  .sort((a, b) => getContactPriority(a) - getContactPriority(b))
  .map((person, i) => (
      <div key={person.crustdata_person_id ?? i} className="mt-3">
        <p className="text-sm font-semibold">
          {person.basic_profile?.name || "Name unavailable"}
        </p>
        <p className="text-xs text-slate-400">
          {person.basic_profile?.headline || "Designation unavailable"}
        </p>

        {person.experience?.employment_details?.current?.[0]?.title && (
          <p className="text-xs text-slate-400">
            {person.experience.employment_details.current[0].title}
          </p>
        )}

        {person.social_handles?.professional_network_identifier?.profile_url && (
          <a
            href={person.social_handles.professional_network_identifier.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-300 hover:underline"
          >
            View profile ↗
          </a>
        )}
        <button
  onClick={() =>
    generateOutreach(person, name)
  }
  className="mt-3 rounded-lg border border-cyan-400/30 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-400/10"
>
  ✉ Generate Outreach
</button>

{outreachDrafts[person.crustdata_person_id] && (
  <div className="mt-3 rounded-lg border border-cyan-400/20 p-3">
    <p className="mb-2 text-xs font-semibold text-cyan-300">
      Personalized Message
    </p>
    <textarea
      readOnly
      value={outreachDrafts[person.crustdata_person_id]}
      className="w-full rounded-lg bg-slate-950 p-3 text-xs text-slate-200"
      rows={7}
    />
    <button
      onClick={() =>
        navigator.clipboard.writeText(
          outreachDrafts[person.crustdata_person_id]
        )
      }
      className="mt-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
    >
      Copy Message
    </button>
  </div>
)}
      </div>
    ))}
  </div>
)}

{peopleErrors[company.crustdata_company_id] && (
  <p className="mt-2 text-xs text-red-400">
    {peopleErrors[company.crustdata_company_id]}
  </p>
)}

{jobResults[company.crustdata_company_id] && (
  <div className="mt-3 rounded-lg border border-white/10 p-3 text-left">
    <p className="text-xs font-semibold text-cyan-300">
      {jobResults[company.crustdata_company_id].length > 0
        ? `${jobResults[company.crustdata_company_id].length} job listings found`
        : "No job listings found in this search"}
    </p>

    {jobResults[company.crustdata_company_id].map((job, i) => (
      <div key={i} className="mt-2">
        <p className="text-sm">
          {job.job_details?.title || "Untitled role"}
        </p>
        <p className="text-xs text-slate-400">
          {job.job_details?.category || "Category unavailable"} ·{" "}
          {job.job_details?.workplace_type || "Workplace not specified"}
        </p>

        {job.job_details?.url && (
          <a
            href={job.job_details.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-300 hover:underline"
          >
            View job ↗
          </a>
        )}
      </div>
    ))}
  </div>
)}

{jobErrors[company.crustdata_company_id] && (
  <p className="mt-2 text-xs text-red-400">
    {jobErrors[company.crustdata_company_id]}
  </p>
)}

                  </div>
                </div>
              );
            })}
          </div>

            <div className="mt-10 mb-8">
  <div className="mb-5 flex items-center justify-between">
    <div>
      <h3 className="text-xl font-semibold">★ Saved Startups</h3>
      <p className="mt-1 text-sm text-slate-400">
        Your bookmarked opportunities
      </p>
    </div>

    <span className="rounded-full bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">
      {savedCompanies.length} saved
    </span>
  </div>

  <input
    value={savedSearch}
    onChange={(e) => setSavedSearch(e.target.value)}
    placeholder="Search saved companies..."
    className="mb-4 w-full rounded-xl border border-white/10 bg-[#111b2d] p-3 text-sm outline-none focus:border-cyan-400"
  />

  <div className="space-y-3">
    {savedCompanies
      .filter((company) =>
        (company.basic_info?.name || "")
          .toLowerCase()
          .includes(savedSearch.toLowerCase())
      )
      .map((company) => (
        <div
          key={company.crustdata_company_id}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111b2d] p-4"
        >
          <div>
            <p className="font-semibold">
              {company.basic_info?.name || "Unknown company"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {company.basic_info?.primary_domain || "Website unavailable"}
            </p>
          </div>

          <button
            onClick={() =>
  setSavedCompanies((prev) =>
    prev.filter(
      (c) => c.crustdata_company_id !== company.crustdata_company_id
    )
  )
}
            className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300 hover:bg-red-400/10"
          >
            Remove
          </button>
        </div>
      ))}

    {savedCompanies.length === 0 && (
      <p className="rounded-xl border border-white/10 p-5 text-center text-sm text-slate-400">
        No saved startups yet. Bookmark a company to see it here.
      </p>
    )}
  </div>
</div>
          <footer className="mt-12 border-t border-white/10 pt-5 text-xs text-slate-500">
            FounderRadar · Startup intelligence for your next opportunity.
          </footer>
        </section>
      </div>
    </main>
  );
}
