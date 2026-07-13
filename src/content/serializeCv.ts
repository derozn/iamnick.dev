import { profile, roles, sideProjects, skillGroups, education, contact } from './cv';
import { formatYearMonth } from '@/lib/formatDate';

/**
 * serializeCv — renders the typed CV data as compact plain text for Madame
 * Zara's system prompt (the fortune-teller LLM attraction). This is the ONLY
 * source of truth the model gets about Nick; nothing here is invented, it's a
 * 1:1 rendering of cv.ts. Deterministic (snapshot-tested) so the prompt is
 * byte-stable across requests.
 */
export function serializeCv(): string {
  const lines: string[] = [];

  lines.push(`# ${profile.name}`);
  lines.push(`${profile.headline} — ${profile.location}`);
  lines.push(profile.shortBio);

  lines.push('', '## Roles (newest first)');
  for (const r of roles) {
    const end = r.end ? formatYearMonth(r.end) : 'present';
    lines.push('', `### ${r.title} at ${r.company} (${formatYearMonth(r.start)} – ${end})`);
    if (r.promotion) lines.push(r.promotion);
    lines.push(`${r.location}. ${r.blurb}`);
    for (const h of r.highlights) lines.push(`- ${h}`);
    lines.push(`Tech: ${r.tech.join(', ')}`);
  }

  lines.push('', '## Side projects');
  for (const p of sideProjects) {
    lines.push('', `### ${p.name}${p.url ? ` (${p.url})` : ''}`);
    lines.push(p.blurb);
    for (const h of p.highlights) lines.push(`- ${h}`);
    lines.push(`Tech: ${p.tech.join(', ')}`);
  }

  lines.push('', '## Skills');
  for (const g of skillGroups) lines.push(`- ${g.label}: ${g.skills.join(', ')}`);

  lines.push('', '## Education');
  lines.push(
    `${education.degree}, ${education.institution} (${education.period}) — ${education.grade}`,
  );

  lines.push('', '## Contact');
  lines.push(`Email: ${contact.email}`);
  lines.push(`LinkedIn: ${contact.linkedin}`);
  lines.push(`GitHub: ${contact.github}`);
  lines.push(`CV download: available on this site (the Contact attraction)`);

  return lines.join('\n');
}
