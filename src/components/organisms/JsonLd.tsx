import { contact, education, profile } from '@/content/cv';

/**
 * JsonLd — structured data (Person schema) injected into layout.
 * Server component; no client JS needed.
 */
export function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: 'Lead Software Engineer',
    url: 'https://iamnick.dev',
    email: contact.email,
    sameAs: [contact.linkedin, contact.github],
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
