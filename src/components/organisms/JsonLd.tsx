import { contact, education, profile, roles, skillGroups } from '@/content/cv';

/**
 * JsonLd — structured data (Person schema) injected into layout.
 * Server component; no client JS needed.
 */
export function JsonLd() {
  const current = roles[0]; // roles are newest-first
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: 'Lead Software Engineer',
    description: profile.shortBio,
    url: 'https://iamnick.dev',
    image: 'https://iamnick.dev/opengraph-image',
    email: contact.email,
    sameAs: [contact.linkedin, contact.github],
    worksFor: {
      '@type': 'Organization',
      name: current.company,
    },
    knowsAbout: skillGroups.flatMap((g) => g.skills),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kent',
      addressCountry: 'GB',
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: education.institution,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
