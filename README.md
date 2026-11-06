# **FounderRadar**

### Find opportunities before they become vacancies.

Finding an internship or a job isn't always about applying to openings you see online. Sometimes, the better opportunity is at a company that's growing but hasn't posted a vacancy yet.

That's the idea behind **FounderRadar**.

We built FounderRadar to help students discover growing startups, understand their hiring activity, find the right people to connect with, and prepare personalized outreach messages—all in one place.

## 💡 Why FounderRadar?

Most students spend hours switching between job portals, company websites, LinkedIn profiles, and search engines to find opportunities.

We wanted to make this process easier.

Instead of only showing companies that have already posted jobs, FounderRadar also looks at company growth and other signals that may indicate potential opportunities.

## What can you do with FounderRadar?

- **Discover Startups:** Explore companies using industry-based discovery powered by Crustdata.
- **Track Growth:** See employee count and six-month headcount growth to understand how a company is evolving.
- **Find Potential Opportunities:** Use our experimental Opportunity Fit Score to compare companies based on available signals.
- **Check Hiring Activity:** Look for job listings associated with a company.
- **Find the Right People:** Discover founders, CTOs, and other relevant decision-makers.
- **Prepare Personalized Outreach:** Generate a message draft that you can review, edit, and copy.
- **Save Companies:** Keep interesting startups bookmarked for later.

## How does it work?

The process is simple:

1. Choose an industry and discover companies.
2. FounderRadar fetches company information through the Crustdata API.
3. Review employee growth and other available signals.
4. Check job listings and explore relevant people at a company.
5. Generate a personalized outreach draft and decide what to do next.

The goal is to bring company research and opportunity discovery into one workflow instead of making students do everything manually.

## 🛠️ Built With

- Next.js
- React
- TypeScript
- Tailwind CSS
- Crustdata APIs

## How to Run Locally

First, install the dependencies:

```bash
npm install
```

Create a `.env.local` file in the root directory and add your Crustdata API key:

```env
CRUSTDATA_API_KEY=your_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use FounderRadar.

**Note:** Keep your API key private. Never commit `.env.local` or expose the key in frontend code.

## Understanding the Opportunity Fit Score

FounderRadar uses an experimental score to help users prioritize companies based on available growth, hiring, company-scale, and contact signals.

It is our own ranking approach, not an official Crustdata score or a guarantee that a company is hiring. Similarly, not finding a job listing does not necessarily mean that a company has no openings.

## What We Want to Build Next

This is our starting point, and there is plenty more we would like to improve:

- Expand discovery beyond India with optional location preferences.
- Add stronger evidence links and timestamps for company signals.
- Monitor changes in company growth and hiring activity.
- Improve how opportunities are ranked.
- Add user accounts and cloud-synced saved companies.

## Built At

**ContextCon 04 | IIT Kanpur | 5–6 November 2026**

Built with the idea that the next opportunity might exist before the vacancy does.