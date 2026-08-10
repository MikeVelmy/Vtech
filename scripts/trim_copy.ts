// Copy-trim pass: reduces word count across the marketing pages while
// keeping headlines, kickers, and CTAs verbatim.
//
// Run from the repo root:
//   node --experimental-strip-types scripts/trim_copy.ts
//
// The script asserts that every `from` string exists at least once in its
// target file (and fails loudly if any is missing), then replaces all
// occurrences so the FAQ visible answers stay in lockstep with the
// FAQPage JSON-LD.

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

type Edit = { from: string; to: string };

const INDEX = "index.html";
const SERVICES = "services.html";
const PORTFOLIO = "portfolio.html";
const ABOUT = "about.html";
const CONTACT = "contact.html";

const FOOTER_FROM =
  "We build websites for local businesses that are found on Google, trusted by visitors, and built to turn clicks into calls and messages.";
const FOOTER_TO =
  "Websites for local businesses that get found on Google and turn clicks into calls.";

const edits: Record<string, Edit[]> = {
  [INDEX]: [
    {
      from: `We design premium websites, web apps, and e-commerce platforms for businesses in Ghana and worldwide, engineered around how your customers actually search, buy, and book. Bringing the future to the present.`,
      to: `Premium websites, web apps, and e-commerce platforms for Ghana and worldwide, engineered around how your customers search, buy, and book. Bringing the future to the present.`,
    },
    {
      from: `No client case studies yet, so instead of borrowed screenshots, here are two concept builds we designed ourselves to show the range.`,
      to: `Two concept builds we designed ourselves, showing the range we would bring to yours.`,
    },
    {
      from: `We don't just build pretty websites. Every page is built around getting the phone to ring or the WhatsApp message to come in.`,
      to: `Not just pretty websites. Every page is built to make the phone ring.`,
    },
    {
      from: `Beyond marketing sites: SaaS dashboards and online stores built to scale, for clients in Ghana and worldwide.`,
      to: `SaaS dashboards and online stores, built to scale.`,
    },
    {
      from: `No long onboarding, just a short conversation and a clear timeline from there.`,
      to: `A short conversation, then a clear timeline.`,
    },
    {
      from: `Tell us about your business on WhatsApp: your business name and the package you're leaning toward.`,
      to: `Your business name and the package you're leaning toward, on WhatsApp.`,
    },
    {
      from: `Share what you have: inventory, packages, photos, logo. Don't have it all? We'll tell you exactly what's needed.`,
      to: `Share inventory, packages, photos, and logo. Not sure what you need? We'll tell you.`,
    },
    {
      from: `Built mobile-first, with on-page SEO and your Google Business Profile set up alongside it.`,
      to: `Mobile first, with on-page SEO and your Google Business Profile set up alongside.`,
    },
    {
      from: `Typically live within a few weeks of receiving your content,`,
      to: `Live within a few weeks of receiving your content,`,
    },
    {
      from: `No two businesses sell the same way, so instead of one generic template, we build around how your customers actually search, decide, and reach out.`,
      to: `One generic template never fits. We build around how your customers actually search and buy.`,
    },
    {
      from: `Inventory-friendly layouts, "Get in Touch" CTAs, and local visibility for buyers searching nearby.`,
      to: `Inventory-friendly layouts, "Get in Touch" CTAs, and local visibility for nearby searches.`,
    },
    {
      from: `Custom dashboards, e-commerce stores, and SaaS builds for founders and businesses scaling beyond Ghana.`,
      to: `Custom dashboards, e-commerce stores, and SaaS builds for founders scaling beyond Ghana.`,
    },
    {
      from: `Tell us about your business on WhatsApp and we'll tell you exactly what it takes to get you found. No pressure, no jargon.`,
      to: `Message us on WhatsApp and we'll tell you exactly what it takes to get found.`,
    },
    { from: FOOTER_FROM, to: FOOTER_TO },
  ],

  [SERVICES]: [
    {
      from: `We build around how your specific customers search and buy, so every site speaks their language from day one, whatever your business is.`,
      to: `Every site is built around how your specific customers search and buy.`,
    },
    {
      from: `<p class="mt-2 text-slate-500">Every feature is aimed at getting nearby customers to call, message, or walk in.</p>`,
      to: ``,
    },
    {
      from: `<p class="mt-2 text-slate-500">Every feature is aimed at turning browsers into booking inquiries.</p>`,
      to: ``,
    },
    {
      from: `Product or inventory layout that puts what you offer front and center`,
      to: `Inventory and product layouts that put what you sell front and center`,
    },
    {
      from: `Lead-capture CTAs built around exactly how your customers take the next step`,
      to: `Lead-capture CTAs built around how your customers take the next step`,
    },
    {
      from: `Location &amp; service-area pages so nearby customers find you first`,
      to: `Location and service-area pages for "near me" searches`,
    },
    {
      from: `<li class="flex gap-3"><svg class="h-5 w-5 text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12.75l6 6 9-13.5"/></svg><span class="text-slate-600">Click-to-call and WhatsApp buttons for fast customer inquiries</span></li>`,
      to: ``,
    },
    {
      from: `<li class="flex gap-3"><svg class="h-5 w-5 text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12.75l6 6 9-13.5"/></svg><span class="text-slate-600">Trust signals (reviews, certifications, partners) front and center</span></li>`,
      to: ``,
    },
    {
      from: `Service &amp; package pages that showcase your best offers`,
      to: `Service and package pages that showcase your best offers`,
    },
    {
      from: `Local visibility for "[your service] near me" and "[city] [your service]" searches`,
      to: `Local visibility for "[your service] near me" searches`,
    },
    {
      from: `<li class="flex gap-3"><svg class="h-5 w-5 text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12.75l6 6 9-13.5"/></svg><span class="text-slate-600">WhatsApp inquiry button for fast, familiar booking conversations</span></li>`,
      to: ``,
    },
    {
      from: `<li class="flex gap-3"><svg class="h-5 w-5 text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12.75l6 6 9-13.5"/></svg><span class="text-slate-600">Seasonal promotion sections you can hand us updates for anytime</span></li>`,
      to: ``,
    },
    {
      from: `This is the full toolkit we build with. Exact inclusions vary by package. See the tiers below for what's bundled where.`,
      to: `The full toolkit. Exact inclusions vary by package.`,
    },
    {
      from: `No numbers here on purpose. Message us and we'll recommend the right package once we know your business.`,
      to: `No numbers on purpose. Message us and we'll recommend the right package.`,
    },
    {
      from: `Available alongside any package: content updates, review monitoring, and priority support so your site keeps working after launch.`,
      to: `Content updates, review monitoring, and priority support after launch.`,
    },
    {
      from: `Web apps, online stores, and SaaS products are scoped and quoted separately from the packages above. Every build is different, so we price after understanding what you're building.`,
      to: `Scoped and quoted separately from the packages above. Priced after we understand your build.`,
    },
    {
      from: `User accounts, dashboards, and internal tools built around your workflow`,
      to: `User accounts, dashboards, and internal tools around your workflow`,
    },
    {
      from: `Product catalog, cart, and secure checkout built for mobile buyers first`,
      to: `Product catalog, cart, and secure checkout for mobile buyers`,
    },
    {
      from: `Local and international payment options, set up correctly from day one`,
      to: `Local and international payment options, set up from day one`,
    },
    {
      from: `SEO-ready product pages so buyers find you, not just your competitors`,
      to: `SEO-ready product pages so buyers find you first`,
    },
    {
      from: `MVP builds for founders who need something real to show users or investors`,
      to: `MVP builds for founders who need something real to show investors`,
    },
    {
      from: `Subscription billing, user auth, and multi-tenant accounts done properly`,
      to: `Subscription billing, user auth, and multi-tenant accounts, done properly`,
    },
    {
      from: `Most sites go live within a few weeks of us receiving your content and photos. Simpler sites move faster; larger or more complex builds take a bit longer, and we'll give you a clear estimate once we've scoped your project.`,
      to: `Most sites go live within a few weeks of receiving your content. You'll get a clear estimate once your project is scoped.`,
    },
    // FAQ answers (visible + FAQPage JSON-LD stay verbatim-matched)
    {
      from: `Every business is different: what you offer, number of locations, how much content you already have. A flat number on a website can't account for that, so instead of guessing, we quote you accurately after a quick conversation about your actual business.`,
      to: `Every business is different, so a flat number can't work. We quote you accurately after a quick conversation about your business.`,
    },
    {
      from: `No, but the sooner we have it, the sooner your build timeline starts. Once you reach out, we'll give you a simple checklist of exactly what to send so nothing holds things up.`,
      to: `No, but the sooner we have it, the sooner your timeline starts. We'll send you a checklist of exactly what to share.`,
    },
    {
      from: `Not at all. We'll help you pick and connect one as part of the Growth and Premium packages. You don't need to arrive with anything already set up.`,
      to: `Not at all. We'll pick and connect one for you as part of Growth and Premium.`,
    },
    {
      from: `If you're comfortable making basic edits, we can walk you through it. If you'd rather not deal with it, that's exactly what the optional Monthly Care add-on is for: we handle updates, review monitoring, and support for you.`,
      to: `Yes, and we'll walk you through it. Prefer not to? The optional Monthly Care add-on handles updates and support for you.`,
    },
    {
      from: `That's fine. Our concept builds are just two examples, not a client list. The same playbook (clear offer pages, WhatsApp and call CTAs, Google Business Profile optimization) works for almost any local business that depends on being found and contacted online. Tell us what you do and we'll tell you honestly whether we're a good fit.`,
      to: `That's fine. The same playbook works for almost any local business. Tell us what you do and we'll tell you honestly if we're a good fit.`,
    },
    {
      from: `We keep you in the loop throughout the build rather than disappearing until launch day, so there shouldn't be surprises. If something isn't right, we'll revise it until it is before calling the project done.`,
      to: `We keep you in the loop throughout the build. If something isn't right, we'll revise it until it is.`,
    },
    {
      from: `Both. The Starter, Growth, and Premium packages are for marketing and business websites. If you need a web application, an online store, or a SaaS product, that's scoped and quoted separately.`,
      to: `Both. The packages above are for marketing and business websites. Web apps, online stores, and SaaS products are scoped and quoted separately.`,
    },
    {
      from: `Both. The Starter, Growth, and Premium packages above are for marketing and business websites. If you need a web application, an online store, or a SaaS product, that's scoped and quoted separately. See <a href="#web-apps-saas" class="ulink">Web Apps &amp; SaaS</a> below.`,
      to: `Both. The packages above are for marketing and business websites. Web apps, online stores, and SaaS products are scoped and quoted separately. See <a href="#web-apps-saas" class="ulink">Web Apps &amp; SaaS</a> below.`,
    },
    {
      from: `Velmure Tech is based in Accra, Ghana, and most of our clients are Ghanaian businesses, but the process works the same over WhatsApp and email for clients anywhere in the world. Distance doesn't change how we scope, build, or deliver a project.`,
      to: `Based in Accra, Ghana, and serving clients anywhere in the world. Distance doesn't change how we scope, build, or deliver.`,
    },
    {
      from: `Send us a quick message with your business name, and we'll recommend a package for you.`,
      to: `Message us with your business name and we'll recommend a package.`,
    },
    { from: FOOTER_FROM, to: FOOTER_TO },
  ],

  [PORTFOLIO]: [
    {
      from: `We're a brand-new agency, so we'd rather this page be honest than dressed up with stock templates pretending to be case studies. No client case studies yet, but here are two self-initiated concept builds that show exactly what we'd bring to yours.`,
      to: `We're a brand new agency, so no borrowed screenshots or fake case studies. Here are two concept builds we designed ourselves, showing exactly what we'd bring to yours.`,
    },
    {
      from: `Neither of these has a client behind it. We designed and built both ourselves to show the range of what we'd bring to yours before a single requirements call. Real client work starts in the section below.`,
      to: `Designed and built by us, with no client behind either yet. This is the range we'd bring to yours.`,
    },
    {
      from: `The hero is Torres del Paine under a real night sky, coordinates and all, because generic beach-and-suitcase imagery is the fastest way for a travel site to look interchangeable.`,
      to: `Torres del Paine under a real night sky, so nothing looks interchangeable.`,
    },
    {
      from: `Where-to, when, and travel-style fields sit above the fold, so browsing starts in the first five seconds instead of after a scroll.`,
      to: `Where to, when, and style fields sit above the fold, so browsing starts in seconds.`,
    },
    {
      from: `The chat button is part of the layout from the first mockup, matching how Velmure Tech's actual client sites turn visitors into conversations.`,
      to: `The chat button is part of the layout from the first mockup.`,
    },
    {
      from: `Deep navy with a warm gold accent, closer to chrome under showroom lighting than the blue-gradient every auto template reaches for by default.`,
      to: `Deep navy with a warm gold accent, closer to chrome under showroom lighting than template blue.`,
    },
    {
      from: `The hero is a close, specific vehicle (grille, badge, headlight) because a single real car sells harder than a wide shot of an anonymous parking lot.`,
      to: `A close, specific vehicle, because a single real car sells harder than a parking lot.`,
    },
    {
      from: `"Finance a Car" sits right next to "Browse Inventory" in the hero, because local buyers decide on monthly affordability as much as the car itself.`,
      to: `"Finance a Car" sits right next to "Browse Inventory", because local buyers decide on monthly affordability.`,
    },
    {
      from: `The concepts above prove what we can build, but neither is a client, and we're not going to pretend otherwise with borrowed screenshots and made-up case studies. What we can promise instead is founder-level attention on your project, because right now you wouldn't just be a client. You'd be the reason this page starts to fill up with real ones.`,
      to: `The concepts above prove what we can build. What you get instead is founder-level attention, because right now you wouldn't just be a client. You'd be the reason this page fills up with real ones.`,
    },
    {
      from: `Once your site is live, send us the link, and we'll feature it right here, front and center, as project #1.`,
      to: `Once your site is live, send us the link and we'll feature it here as project #1.`,
    },
    { from: FOOTER_FROM, to: FOOTER_TO },
  ],

  [ABOUT]: [
    {
      from: `I started Velmure Tech because I noticed something. Most small businesses don't have a website problem. They have a <em class="text-ink not-italic font-semibold">visibility</em> problem. Plenty of local businesses already have a website. Far fewer of them actually show up when a nearby customer searches for what they sell.`,
      to: `Most small businesses don't have a website problem. They have a <em class="text-ink not-italic font-semibold">visibility</em> problem. Plenty already have a site. Far fewer show up when a nearby customer searches for what they sell.`,
    },
    {
      from: `Most people call me Mike. I built this agency to close that gap. Instead of handing every client the same generic template, I build around how your specific customers search, decide, and reach out, whatever your business happens to be.`,
      to: `I built this agency to close that gap. Instead of one generic template, I build around how your customers search, decide, and reach out.`,
    },
    {
      from: `Every project I take on starts from the same question. If someone searched for this business right now, would they find it, and would what they found make them want to reach out?`,
      to: `Every project starts from one question. If someone searched for your business right now, would they find it, and would they want to reach out?`,
    },
    {
      from: `I want to make sure that when a local customer searches for a business like yours, you're the one they <span class="text-secondary">find, trust, and contact first</span>, not your competitors.`,
      to: `When a local customer searches for a business like yours, you should be the one they <span class="text-secondary">find, trust, and contact first</span>.`,
    },
    {
      from: `The same pattern shows up everywhere. High-intent local searches, real buying decisions, and websites that are usually the weakest link.`,
      to: `High-intent local searches, real buying decisions, and websites that are usually the weakest link.`,
    },
    {
      from: `People rarely go with the first business they think of. They search, compare, and choose whoever looks most credible online.`,
      to: `People search, compare, and choose whoever looks most credible online.`,
    },
    {
      from: `A site that looks outdated or untrustworthy loses the customer before a conversation even starts, whatever you're selling.`,
      to: `An outdated or untrustworthy site loses the customer before the conversation starts.`,
    },
    {
      from: `Most web agencies build the same template for everyone, which means it fits no one particularly well. I'd rather take the time to understand how your business actually gets chosen, and build around that.`,
      to: `Most agencies build one template for everyone. We build around how your business actually gets chosen.`,
    },
    {
      from: `Every design decision is made with "will this help you get found?" in mind.`,
      to: `Every design decision starts with one question: will this help you get found?`,
    },
    {
      from: `Straightforward packages, clear communication, and a site built to do a job, not just look nice.`,
      to: `Straightforward packages, clear communication, and a site built to do a job.`,
    },
    {
      from: `A few honest reasons to consider Velmure Tech over a bigger, more generic agency.`,
      to: `Honest reasons to choose Velmure Tech over a bigger, more generic agency.`,
    },
    {
      from: `Every site is built around how your specific customers search, decide, and reach out, not a one-size-fits-all template. If your business is local and lives or dies by search, it's worth a conversation.`,
      to: `Every site is built around how your customers search and decide, never a one-size-fits-all template. If your business lives or dies by search, it's worth a conversation.`,
    },
    {
      from: `There's no account manager passing your project down a chain. You message me, and I'm the one building your site.`,
      to: `No account manager passing your project down a chain. You message me, and I'm the one building your site.`,
    },
    {
      from: `Most sites go live within a few weeks of receiving your content, depending on scope. We'll give you a realistic estimate up front and keep you updated throughout.`,
      to: `Most sites go live within a few weeks of receiving your content. We'll give you a realistic estimate up front.`,
    },
    {
      from: `No inflated portfolio, no fake reviews, no hidden fees. What you see on this site is what you get.`,
      to: `No inflated portfolio, no fake reviews, no hidden fees. What you see is what you get.`,
    },
    { from: FOOTER_FROM, to: FOOTER_TO },
  ],

  [CONTACT]: [
    {
      from: `Message us on WhatsApp or fill out the form below. Either way, include your business name and which package you're interested in so we can get back to you faster.`,
      to: `Message us on WhatsApp or use the form. Include your business name and the package you're interested in.`,
    },
    {
      from: `The fastest way to reach us. Send your business name and which package you're interested in (Starter, Growth, or Premium) and we'll take it from there.`,
      to: `The fastest way to reach us. Send your business name and package (Starter, Growth, or Premium).`,
    },
    { from: FOOTER_FROM, to: FOOTER_TO },
  ],
};

const ROOT = process.cwd();

function countWords(text: string): number {
  const visible = text
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return visible ? visible.split(" ").length : 0;
}

const failures: string[] = [];
let totalReplacements = 0;

for (const [file, list] of Object.entries(edits)) {
  const abs = join(ROOT, file);
  const before = readFileSync(abs, "utf8");
  const beforeWords = countWords(before);
  let content = before;

  for (const edit of list) {
    const count = content.split(edit.from).length - 1;
    if (count === 0) {
      failures.push(`${file}: NOT FOUND -> ${edit.from.slice(0, 80)}...`);
      continue;
    }
    content = content.split(edit.from).join(edit.to);
    totalReplacements += count;
  }

  if (content !== before) {
    writeFileSync(abs, content);
    const afterWords = countWords(content);
    const pct = Math.round(((beforeWords - afterWords) / beforeWords) * 100);
    console.log(
      `${file}: ${beforeWords} -> ${afterWords} visible words (${pct}% cut, ${totalReplacements} total replacements)`
    );
  }
}

if (failures.length > 0) {
  console.error("\nFAILED REPLACEMENTS:");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
} else {
  console.log(`\nAll replacements applied successfully.`);
}
