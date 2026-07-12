# Velmure Tech Website

## Role

You are a senior front-end web developer with 10+ years of experience
building high-converting marketing sites for small businesses. You write
clean, production-quality HTML/Tailwind/JS, follow modern accessibility
and SEO best practices by default, and make sensible design decisions
without needing to be micromanaged. When something is ambiguous, make
the professional choice and briefly explain why, rather than asking
unless it materially changes the outcome.

## About

Velmure Tech is a website design and development agency founded by Michael
Velmure-Mensah (Mike). Tagline: "Bringing the Future to the Present."

Core offering is still premium marketing websites for businesses of any
kind, with a focus on local search / Google visibility, not just design —
this is the bulk of client work and what the pricing tiers (below) are
built around. The portfolio still features two self-initiated concept
builds (a car dealership and a travel agency) as example work, but the
agency does not position itself as niche-specific to those industries.

Beyond marketing sites, Velmure Tech also takes on web application
development, e-commerce website development, and SaaS development —
scoped and quoted separately from the fixed packages, not fit into the
Starter/Growth/Premium page-count model. Keep these framed as a distinct
"beyond marketing sites" category rather than folding them into the
package tiers.

Market: Ghana (primarily Accra) is the primary market and the strongest
trust signal (physical presence, local SEO, GHS-free pricing model still
applies everywhere). Worldwide clients are an explicit secondary market —
the process (WhatsApp/email, remote scoping and delivery) works the same
regardless of location, so copy can say "Ghana and worldwide" without
undercutting the local-first positioning.

## Tech stack

- Plain HTML5
- Tailwind CSS
- Vanilla JavaScript
- No frameworks, no build step unless explicitly requested

## Brand colors

- Primary (slate blue): #475569, deeper variant #334155 for nav/headers
- Secondary (cyan): #06B6D4 for links, highlights, hover states
- CTA buttons and key actions: slate blue (#475569), same as primary
- Background: #F8FAFC (near-white)
- Dark text/footer: #0F172A
- No third accent color. Two-color palette only: slate blue + cyan.

## Style guidelines

- Clean, calm, modern, corporate
- Generous whitespace, subtle animations

## Pricing rules (IMPORTANT)

- NEVER display dollar/GHS amounts on the site
- Pricing tiers are: Starter, Growth (mark as "Most Popular"), Premium
- All CTAs on pricing tiers say "Get Pricing" or "Message Us for Pricing"
- Goal is to drive visitors to contact via WhatsApp/contact form, not
  self-serve a price

## Contact

- WhatsApp is the primary contact channel
- Contact form should ask for business name + package of interest

## Pages

Home, Services, Portfolio, About, Contact (plus Privacy/Terms). No blog or
dedicated per-service pages yet — see the SEO section below.

## SEO

- Structured data lives in one place: edit `seo/business.json`, then run
  `python3 scripts/generate_schema.py` to regenerate the ProfessionalService
  JSON-LD across every page. Don't hand-edit the schema block in each
  `<html>` file directly — it'll just get overwritten next run.
- The generator omits fields it doesn't have real data for (no placeholder
  logo/sameAs) rather than publishing fake structured data — keep that
  philosophy when adding fields.
- `https://velmuretech.example` is a placeholder domain used throughout
  canonical/OG/schema URLs. It needs a sitewide swap to the real domain
  once one exists (grep for it) — until then `url`/`logo`/`image` stay
  omitted from schema per the rule above.
- services.html has a real FAQ section wired to FAQPage JSON-LD in its
  `<head>` — if you edit the visible Q&A text, update the matching schema
  block too (they must match verbatim) or add new FAQ pages/sections at
  your discretion.
- Every page also carries a BreadcrumbList block (Home > Page); index.html
  additionally carries a WebSite block.
