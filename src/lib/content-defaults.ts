/**
 * Registry of every editable copy block on the public website.
 *
 * The DEFAULT value here is the source of truth for "Restore default" and is
 * used as the fallback whenever an administrator has not overridden a block in
 * the database. Overrides live in the `site_content` table.
 */

export type BlockKind = "text" | "textarea" | "richtext" | "image";

export interface BlockDef {
  key: string;
  label: string;
  kind: BlockKind;
  help?: string;
  default: string;
}

export interface PageDef {
  page: string;
  title: string;
  description: string;
  legal?: boolean;
  blocks: BlockDef[];
}

const b = (
  key: string,
  label: string,
  kind: BlockKind,
  def: string,
  help?: string,
): BlockDef => ({ key, label, kind, default: def, ...(help ? { help } : {}) });

export const CONTENT_PAGES: PageDef[] = [
  {
    page: "home",
    title: "Homepage",
    description: "Hero, quick services, today's clinics and featured PHC copy.",
    blocks: [
      b("hero_eyebrow", "Hero eyebrow badge", "text", "Egor LGA · Edo State · Nigeria"),
      b("hero_heading", "Hero heading", "text", "Find the Right Primary Healthcare Centre in Egor"),
      b(
        "hero_subheading",
        "Hero subheading",
        "textarea",
        "Find nearby Primary Healthcare Centres, explore available services, view clinic schedules, and get directions—all in one place.",
      ),
      b("hero_primary_cta", "Primary button text", "text", "Find a PHC"),
      b("hero_secondary_cta", "Secondary button text", "text", "Find the Nearest PHC"),
      b("services_heading", "Quick services heading", "text", "Quick services"),
      b("services_intro", "Quick services description", "text", "Tap a service to find PHCs that offer it."),
      b("today_heading", "Today's clinics heading", "text", "Today's available clinics"),
      b(
        "today_empty",
        "Message when no clinic runs today",
        "textarea",
        "No PHCs report a scheduled clinic today. Many still run general consultation — call ahead to confirm.",
      ),
      b("announcement_label", "Announcement label", "text", "Public health announcement"),
      b("featured_heading", "Featured PHCs heading", "text", "Featured PHCs"),
      b("featured_intro", "Featured PHCs description", "text", "Showing facilities in Egor LGA"),
      b("featured_link", "Featured PHCs link text", "text", "View all"),
    ],
  },
  {
    page: "about",
    title: "About page",
    description: "Mission, vision, programme support, project lead and stakeholder copy.",
    blocks: [
      b("hero_eyebrow", "Hero eyebrow badge", "text", "Egor LGA · Edo State · Nigeria"),
      b("title", "Page title", "text", "About EgorPHCConnect"),
      b(
        "intro",
        "Introduction",
        "textarea",
        "EgorPHCConnect is a community digital platform that helps residents of Egor Local Government Area find Primary Healthcare Centres, learn what services are available, and access primary healthcare with confidence.",
      ),
      b("mission_heading", "Mission heading", "text", "Our mission"),
      b(
        "mission_body",
        "Mission description",
        "textarea",
        "Many residents are unsure which Primary Healthcare Centre is nearest, which clinic runs on which day, or whether a facility is open right now. EgorPHCConnect closes that information gap so that every resident — regardless of their familiarity with the local healthcare system — can take timely action.",
      ),
      b(
        "mission_points",
        "Mission points",
        "richtext",
        [
          "- Improve access to reliable PHC information across Egor LGA.",
          "- Help residents locate the nearest healthcare facility quickly.",
          "- Increase awareness of clinics, immunizations and routine services.",
          "- Promote preventive healthcare and timely access to care.",
          "- Support informed healthcare decisions for families and caregivers.",
          "- Give administrators a simple tool to keep service information accurate.",
        ].join("\n"),
        "One bullet per line, starting with a dash.",
      ),
      b("users_heading", "\"What users can do\" heading", "text", "What users can do"),
      b(
        "users_items",
        "\"What users can do\" cards",
        "richtext",
        [
          "- **Locate nearby PHCs** — Search by ward, address or service across every PHC in Egor LGA.",
          "- **Smart service search** — Filter by general service or by a specific clinic running on a specific day.",
          "- **See today's clinics** — Know at a glance which clinics are scheduled for today in Africa/Lagos time.",
          "- **Get directions** — One-tap Google Maps directions to any facility, with optional location sorting.",
          "- **Contact information** — Call a PHC directly or copy its address from any device.",
          "- **Anonymous feedback** — Share your experience confidentially so services keep improving.",
        ].join("\n"),
        "One card per line: - **Card title** — card description.",
      ),
      b("features_heading", "Platform features heading", "text", "Platform features"),
      b(
        "features_items",
        "Platform feature cards",
        "richtext",
        [
          "- **Advanced PHC search** — Combine name, ward, service, day and open-now filters in any combination.",
          "- **Weekly schedules** — Each PHC publishes a full Monday–Sunday clinic schedule that updates in one place.",
          "- **Open/Closed status** — Live status from opening and closing times in Africa/Lagos timezone.",
          "- **Maps integration** — Direct integration with Google Maps for navigation and discovery.",
          "- **Secure admin management** — Role-based authentication so only approved staff can edit PHC records.",
          "- **Community feedback** — Anonymous feedback feeds back to administrators to improve care quality.",
        ].join("\n"),
        "One card per line: - **Card title** — card description.",
      ),
      b("why_heading", "\"Why it matters\" heading", "text", "Why EgorPHCConnect matters"),
      b("why_col1_heading", "Why it matters — column 1 heading", "text", "For residents"),
      b(
        "why_col1_body",
        "Why it matters — column 1 points",
        "richtext",
        [
          "- Quickly locate healthcare services that meet your needs.",
          "- Reduce unnecessary travel to facilities that are closed or unavailable.",
          "- Access the right clinic on the right day, the first time.",
        ].join("\n"),
      ),
      b("why_col2_heading", "Why it matters — column 2 heading", "text", "For healthcare workers"),
      b(
        "why_col2_body",
        "Why it matters — column 2 points",
        "richtext",
        [
          "- Improve visibility of services offered at each PHC.",
          "- Communicate clinic schedules without paper handouts.",
          "- Receive structured feedback that highlights real concerns.",
        ].join("\n"),
      ),
      b("why_col3_heading", "Why it matters — column 3 heading", "text", "For government and partners"),
      b(
        "why_col3_body",
        "Why it matters — column 3 points",
        "richtext",
        [
          "- Strengthen public awareness of primary healthcare offerings.",
          "- Encourage greater utilization of preventive care.",
          "- Surface gaps in service distribution across wards.",
        ].join("\n"),
      ),
      b("programme_label", "Programme support label", "text", "Programme Support"),
      b("programme_heading", "Programme support heading", "text", "A National Health Fellows Programme project"),
      b(
        "programme_body",
        "Programme support description",
        "richtext",
        "EgorPHCConnect was developed as a project under the **National Health Fellows Programme**, with the goal of improving access to reliable information about Primary Healthcare Centres and available services in Egor Local Government Area, Edo State.\n\nThe platform reflects the Programme's commitment to strengthening primary healthcare delivery through practical, community-focused digital solutions.",
      ),
      b("programme_logo", "Programme logo", "image", "", "Leave empty to use the built-in National Health Fellows logo."),
      b("programme_logo_alt", "Programme logo alt text", "text", "National Health Fellows Programme logo"),
      // The "Meet the Project Visionary" section is intentionally NOT editable
      // from the admin dashboard — it is fixed content in src/routes/about.tsx.

      b("stakeholders_heading", "Stakeholders section heading", "text", "Stakeholders"),
      b(
        "stakeholders_intro",
        "Stakeholders section introduction",
        "textarea",
        "The partners and health leaders supporting primary healthcare access in Egor LGA.",
      ),
      b("managed_heading", "\"How information is managed\" heading", "text", "How information is managed"),
      b(
        "managed_body",
        "\"How information is managed\" text",
        "richtext",
        "PHC records, service lists and weekly schedules are maintained by authorized administrators who sign in with secure accounts. Updates are reflected immediately on the public site. Feedback submitted by visitors helps administrators identify entries that need correction. The platform aims to keep information accurate and up to date, but residents are always encouraged to confirm critical details with the facility directly.",
      ),
      b("vision_heading", "Vision heading", "text", "Our vision"),
      b(
        "vision_body",
        "Vision text",
        "richtext",
        "To become the trusted digital gateway to primary healthcare services in Edo State — empowering every resident of Egor LGA with timely, accurate and accessible healthcare information.",
      ),
      b("contact_heading", "Call to action heading", "text", "Get in touch"),
      b(
        "contact_body",
        "Call to action text",
        "textarea",
        "Have a question, correction or partnership idea? We'd love to hear from you.",
      ),
    ],
  },
  {
    page: "directory",
    title: "PHC Directory",
    description: "Headings and helper text on the directory page (results stay dynamic).",
    blocks: [
      b("title", "Page title", "text", "PHC Directory"),
      b(
        "intro",
        "Page description",
        "textarea",
        "Search Primary Healthcare Centres in Egor LGA by name, ward, service or day.",
      ),
      b("search_placeholder", "Search box placeholder", "text", "Search by name, ward, address or service"),
      b("status_help", "Facility status helper text", "text", "Filter PHCs by their current operating status."),
      b("empty_message", "No results message", "textarea", "No PHCs match your filters. Try clearing a filter or searching a different term."),
    ],
  },
  {
    page: "health",
    title: "Health Information",
    description: "Headings on the health articles page. Articles themselves stay in Health Articles.",
    blocks: [
      b("title", "Page title", "text", "Health information"),
      b("intro", "Page description", "textarea", "Practical, plain-language guidance to keep your family healthy."),
      b("search_placeholder", "Search box placeholder", "text", "Search articles by title, keyword or tag…"),
      b("empty_message", "No results message", "text", "No articles match your search yet."),
    ],
  },
  {
    page: "feedback",
    title: "Feedback page",
    description: "Instructions and confirmation text on the anonymous feedback form.",
    blocks: [
      b("title", "Page title", "text", "Share your feedback"),
      b(
        "intro",
        "Page description",
        "textarea",
        "Your feedback helps improve services at Primary Healthcare Centres in Egor LGA. Submissions are anonymous by default.",
      ),
      b("thanks_title", "Thank-you heading", "text", "Thank you"),
      b(
        "thanks_body",
        "Thank-you message",
        "textarea",
        "Your feedback has been submitted. It helps improve services for everyone in Egor LGA.",
      ),
    ],
  },
  {
    page: "contact",
    title: "Contact page",
    description: "Contact routes, emergency guidance and closing note.",
    blocks: [
      b("title", "Page title", "text", "Contact us"),
      b(
        "intro",
        "Page description",
        "textarea",
        "We welcome corrections, partnership ideas and accessibility reports. The best way to reach the team depends on what you'd like to share.",
      ),
      b("card1_title", "Card 1 heading", "text", "Share feedback about a PHC"),
      b(
        "card1_body",
        "Card 1 text",
        "textarea",
        "Use the anonymous feedback form to rate a facility and share comments. Feedback is reviewed regularly to improve service quality.",
      ),
      b("card1_action", "Card 1 link text", "text", "Open feedback form →"),
      b("card2_title", "Card 2 heading", "text", "General enquiries"),
      b(
        "card2_body",
        "Card 2 text",
        "textarea",
        "For partnership ideas, corrections to PHC information or accessibility reports, please reach us through the feedback form.",
      ),
      b("card2_action", "Card 2 link text", "text", "Open feedback form →"),
      b("card3_title", "Card 3 heading", "text", "Medical emergencies"),
      b(
        "card3_body",
        "Card 3 text",
        "textarea",
        "For urgent medical issues, do not contact us — call emergency services immediately or visit the nearest healthcare facility.",
      ),
      b("card3_action", "Card 3 link text", "text", "Call 112"),
      b("emergency_number", "Emergency phone number", "text", "112"),
      b("card4_title", "Card 4 heading", "text", "Egor LGA"),
      b(
        "card4_body",
        "Card 4 text",
        "textarea",
        "EgorPHCConnect serves residents of Egor Local Government Area, Edo State, Nigeria. Browse the directory to find facilities near you.",
      ),
      b("card4_action", "Card 4 link text", "text", "Open directory →"),
      b(
        "footnote",
        "Closing note",
        "textarea",
        "Enquiries are reviewed on a best-effort basis. For privacy questions please see our Privacy Policy.",
      ),
    ],
  },
  {
    page: "privacy",
    title: "Privacy Policy",
    description: "Legal content — review carefully before publishing.",
    legal: true,
    blocks: [
      b("title", "Page title", "text", "Privacy Policy"),
      b("last_updated", "Last updated", "text", "29 June 2026"),
      b(
        "body",
        "Policy text",
        "richtext",
        `EgorPHCConnect ("we", "our", "the platform") is a community digital directory of Primary Healthcare Centres serving Egor Local Government Area, Edo State, Nigeria. We respect your privacy and are committed to handling any information you share with care.

## Information we collect

- **Feedback submissions.** When you submit feedback about a PHC we collect the facility you visited, ratings (overall, staff professionalism, waiting time, cleanliness), the optional service used, and any free-text comments. Feedback is anonymous by default — we do not require your name or contact details.
- **Administrator accounts.** Approved administrators authenticate using email and password or a third-party identity provider (such as Google). For authenticated users we store the email address, an internal user identifier and a role indicating administrator status. Passwords are managed by our authentication provider and are never stored by us in plain text.
- **Uploaded PHC information.** Administrators may upload PHC details including names, addresses, wards, opening and closing times, weekly clinic schedules, phone numbers, coordinates and photos. This information is intended for public display.
- **Optional device location.** If you choose to use "Find nearest PHC", your browser asks your permission to share your approximate location with this website. We use it only in your browser to sort PHCs by distance — your location is not sent to our servers or stored on our systems.
- **Technical logs.** Like most web services, our hosting infrastructure may collect short-lived technical logs (such as IP address, browser type and request URLs) for operational, security and abuse-prevention purposes.

## How we use information

- To display the PHC directory, today's clinics and weekly schedules to the public.
- To allow administrators to manage PHC records, images and health articles securely.
- To analyze feedback in aggregate so PHC services can be improved.
- To compute the nearest PHC to your device when you grant location permission.
- To maintain the security, integrity and performance of the platform.

## Location data

Location access is always optional. The browser prompt only appears after you choose "Find nearest PHC" or click "Use my location". You can revoke permission at any time in your browser settings — the rest of the platform continues to work normally and you can keep using all manual search and filter features.

## Sharing of information

We do not sell personal information. PHC records, weekly schedules and uploaded photos are intended for public display. Anonymous feedback may be shared with the relevant PHC administrators and local health authorities to improve services. We may share information when required by law or to protect the rights and safety of users.

## Data security

Information is stored on managed cloud infrastructure with industry-standard protections including encryption in transit (HTTPS), encryption at rest, access control through Row Level Security and role-based authentication for administrative actions. While we take reasonable steps to protect information, no system can be guaranteed completely secure.

## Data retention

- PHC records and health articles are retained for as long as they remain useful to the public, and are updated or removed by administrators.
- Feedback submissions are retained to inform service improvement; aggregated insights may be retained indefinitely.
- Administrator account data is retained while the account is active and for a reasonable period after deactivation to meet operational and audit requirements.
- Optional location data is processed only in your browser session and is not retained on our servers.

## Your privacy rights

You may contact us to request access to, correction of or deletion of any information you have provided. Because feedback is anonymous by design, deletion of a specific feedback entry may only be possible if you can help us identify it.

## Children

EgorPHCConnect is intended for adults and parents/guardians acting on behalf of children. We do not knowingly collect personal information from children.

## Changes to this policy

We may update this policy from time to time to reflect changes to the platform, the law or our practices. The "Last updated" date at the top of this page reflects the most recent revision.

## Contact

For privacy-related enquiries, please use the [Contact Us](/contact) page or submit anonymous feedback via the [Feedback](/feedback) page.`,
      ),
    ],
  },
  {
    page: "terms",
    title: "Terms and Conditions",
    description: "Legal content — review carefully before publishing.",
    legal: true,
    blocks: [
      b("title", "Page title", "text", "Terms and Conditions"),
      b("last_updated", "Last updated", "text", "29 June 2026"),
      b(
        "body",
        "Terms text",
        "richtext",
        `## 1. Acceptance of terms

By accessing or using EgorPHCConnect ("the platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.

## 2. About the platform

EgorPHCConnect is a community digital directory of Primary Healthcare Centres in Egor Local Government Area, Edo State, Nigeria. It provides facility listings, clinic schedules, public health information and a feedback channel.

## 3. Acceptable use

- Use the platform lawfully and for its intended community-health purpose.
- Do not attempt to gain unauthorized access to any part of the platform or its data.
- Do not upload or submit content that is unlawful, defamatory, harassing, deceptive or harmful.
- Do not impersonate another person or facility.
- Do not interfere with the platform's security, performance or availability.

## 4. Accuracy of PHC information

We work with administrators to keep facility names, addresses, hours, weekly schedules and contact details up to date. However information may change without notice and may contain errors or omissions. Always confirm critical details directly with the facility before travel or treatment.

## 5. User responsibilities

You are responsible for evaluating the information on the platform and deciding whether it meets your needs. You are responsible for any content you submit through the feedback channel and confirm that you have the right to submit it.

## 6. Intellectual property

The platform's design, code and original content are protected by intellectual property laws. The names of PHCs, ward names and government information remain the property of their respective owners and authorities. You may not copy, redistribute or repurpose substantial portions of the platform without our written permission.

## 7. Feedback submissions

By submitting feedback you grant us a non-exclusive, royalty-free licence to use that feedback to improve services, including sharing aggregated insights with relevant PHC administrators and local health authorities. Anonymous feedback is the default.

## 8. Limitation of liability

The platform and its contents are provided on an "as is" and "as available" basis, without warranties of any kind. To the maximum extent permitted by law, we are not liable for any direct, indirect, incidental or consequential damages arising from your use of, or inability to use, the platform — including reliance on information that turns out to be outdated, incomplete or incorrect.

## 9. Medical information

Information on the platform is intended for general informational purposes only and is not a substitute for professional medical advice, diagnosis or treatment. Always consult a qualified healthcare professional regarding any medical condition. In an emergency, contact emergency services or visit the nearest health facility immediately.

## 10. Availability of services

We aim to keep the platform available at all times but cannot guarantee uninterrupted access. The platform may be unavailable due to maintenance, upgrades or events outside our control.

## 11. Modification of content

We may add, change, suspend or remove any feature or content on the platform at any time without notice. We may also revise these Terms and Conditions; continued use of the platform after a revision constitutes acceptance of the updated terms.

## 12. Third-party services

The platform integrates with third-party services such as map providers and authentication providers. Your use of those services is also governed by their respective terms and privacy policies.

## 13. Governing law

These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes will be resolved in the competent courts of Edo State, Nigeria.

## 14. Contact

Questions about these terms can be sent via our [Contact Us](/contact) page.`,
      ),
    ],
  },
  {
    page: "medical-disclaimer",
    title: "Medical Disclaimer",
    description: "Legal content — review carefully before publishing.",
    legal: true,
    blocks: [
      b("title", "Page title", "text", "Medical Disclaimer"),
      b(
        "subtitle",
        "Page subtitle",
        "text",
        "Please read carefully before using the information on this platform.",
      ),
      b(
        "body",
        "Disclaimer text",
        "richtext",
        `**EgorPHCConnect is an information platform.** It is designed to help residents of Egor Local Government Area locate Primary Healthcare Centres and learn about the services they provide.

The content on this platform — including PHC listings, weekly clinic schedules, opening hours and public health articles — is provided for general information only. It does **not** constitute medical advice, diagnosis or treatment, and should not be used as a substitute for professional healthcare.

Always seek the advice of a qualified healthcare professional with any questions you may have about a medical condition or treatment. Never disregard professional medical advice or delay seeking it because of something you read on EgorPHCConnect.

While we and our administrators make reasonable efforts to keep PHC information accurate and current, services, schedules and contact details may change without notice. Please confirm critical details directly with the facility before travel or treatment.`,
      ),
      b("emergency_heading", "Emergency box heading", "text", "In a medical emergency"),
      b("emergency_number", "Emergency phone number", "text", "112"),
      b(
        "emergency_body",
        "Emergency box text",
        "textarea",
        "If you or someone near you is experiencing a medical emergency, do not rely on this platform. Call the emergency number immediately, or go to the nearest hospital or healthcare facility without delay.",
      ),
      b("consult_heading", "\"When to consult\" heading", "text", "When to consult a healthcare professional"),
      b(
        "consult_body",
        "\"When to consult\" points",
        "richtext",
        [
          "- Any new, severe or worsening symptoms.",
          "- Pregnancy-related concerns, fever in a child or a chronic condition that feels different.",
          "- Before starting, stopping or changing any medication or treatment.",
          "- Mental health concerns including thoughts of self-harm.",
        ].join("\n"),
      ),
      b(
        "footnote",
        "Closing note",
        "textarea",
        "By using EgorPHCConnect you acknowledge and accept this disclaimer. See also our Terms and Conditions and Privacy Policy.",
      ),
    ],
  },
  {
    page: "accessibility",
    title: "Accessibility Statement",
    description: "Accessibility commitments and how to report a problem.",
    legal: true,
    blocks: [
      b("title", "Page title", "text", "Accessibility Statement"),
      b("last_updated", "Last updated", "text", "29 June 2026"),
      b(
        "body",
        "Statement text",
        "richtext",
        `EgorPHCConnect is committed to making primary healthcare information accessible to every resident of Egor Local Government Area, including people using assistive technology, people on low-bandwidth connections and people using older mobile devices.

## What we do

- Use semantic HTML with clear headings, lists and landmarks so screen readers can navigate easily.
- Provide visible focus states and keyboard navigation for all interactive elements.
- Maintain colour contrast that meets recognised accessibility guidelines for body text and key controls.
- Use ARIA labels on icon-only buttons so they are announced clearly by assistive technologies.
- Design responsive layouts that work on small mobile screens as well as larger desktops.
- Use plain, direct language and avoid unnecessary jargon.

## Standards we aim for

We aim to meet WCAG 2.1 Level AA where reasonably practicable. We continuously test the platform and address accessibility issues as part of our normal release process.

## Known limitations

Some content on the platform — such as the embedded Google Maps view — is provided by third parties. We work to ensure these elements include accessible alternatives, but their accessibility may vary outside of our control.

## Tell us about a problem

If you encounter a part of EgorPHCConnect that is difficult to use with assistive technology, please let us know via the [Contact Us](/contact) page or the [Feedback](/feedback) page. We will work to resolve reported issues as quickly as possible.`,
      ),
    ],
  },
  {
    page: "footer",
    title: "Footer",
    description: "Site-wide footer copy.",
    blocks: [
      b("brand", "Footer brand name", "text", "EgorPHCConnect"),
      b(
        "tagline",
        "Footer tagline",
        "textarea",
        "A community health directory for Egor Local Government Area, Edo State, Nigeria.",
      ),
      b("programme_heading", "Programme support heading", "text", "Programme support"),
      b("programme_text", "Programme support text", "text", "Powered by the National Health Fellows Programme."),
      b("copyright", "Copyright line", "text", "EgorPHCConnect · A National Health Fellows Programme project"),
    ],
  },
];

export const PAGE_BY_KEY: Record<string, PageDef> = Object.fromEntries(
  CONTENT_PAGES.map((p) => [p.page, p]),
);

/** Flat map of "page.block_key" → default value. */
export const DEFAULT_CONTENT: Record<string, string> = Object.fromEntries(
  CONTENT_PAGES.flatMap((p) => p.blocks.map((blk) => [`${p.page}.${blk.key}`, blk.default])),
);

export function defaultContent(page: string, key: string): string {
  return DEFAULT_CONTENT[`${page}.${key}`] ?? "";
}

export const LEGAL_WARNING =
  "Changes to legal or policy content may affect the terms under which users interact with this platform. Review carefully before publishing.";
