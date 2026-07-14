import { profile, roles, sideProjects, skillGroups, education, contact } from '@/content/cv';
import { formatYearMonth } from '@/lib/formatDate';

/**
 * StaticCv — the full CV as plain, semantic, always-present DOM.
 *
 * The 3-D carnival is the *experience*, but its canvas is `aria-hidden` and every
 * CV section only surfaces behind a click. That leaves nothing for search-engine
 * crawlers or assistive tech to read, so the entire résumé is mirrored here as
 * real markup (one `<h1>`, sectioned content, real links). It's visually hidden
 * (the `.static-cv` clip technique in globals.css) — sighted visitors get the
 * interactive scene; crawlers and screen readers get the complete, accessible
 * document. Under `prefers-reduced-motion` (where the 3-D scene never mounts) the
 * same markup is REVEALED as a styled letterpress document, so those visitors read
 * the CV instead of a bare backdrop. This is the page's primary content, not
 * keyword padding: it matches the visual experience one-to-one.
 */
export function StaticCv() {
  return (
    <main className="static-cv" aria-label={`${profile.name} — résumé`}>
      <h1>
        {profile.name} — {profile.headline}
      </h1>
      <p>{profile.shortBio}</p>
      <p>Based in {profile.location}.</p>

      <section aria-labelledby="resume-experience">
        <h2 id="resume-experience">Experience</h2>
        {roles.map((role) => (
          <article key={role.id}>
            <h3>
              {role.title}, {role.company}
            </h3>
            <p>
              {formatYearMonth(role.start)} – {formatYearMonth(role.end)} · {role.location}
            </p>
            {role.promotion && <p>{role.promotion}</p>}
            <p>{role.blurb}</p>
            <ul>
              {role.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            <p>Technologies: {role.tech.join(', ')}.</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="resume-projects">
        <h2 id="resume-projects">Projects</h2>
        {sideProjects.map((p) => (
          <article key={p.id}>
            <h3>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </h3>
            <p>{p.blurb}</p>
            <ul>
              {p.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            <p>Technologies: {p.tech.join(', ')}.</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="resume-skills">
        <h2 id="resume-skills">Skills</h2>
        {skillGroups.map((g) => (
          <div key={g.label}>
            <h3>{g.label}</h3>
            <p>{g.skills.join(', ')}.</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="resume-education">
        <h2 id="resume-education">Education</h2>
        <p>
          {education.degree}, {education.institution} ({education.period}) — {education.grade}.
        </p>
      </section>

      <section aria-labelledby="resume-doodle-wall">
        <h2 id="resume-doodle-wall">Doodle wall</h2>
        <p>
          Visitors to the carnival leave a drawing behind — a wall of tiles, one per visitor.{' '}
          {/* The overlay is the wall's home when the 3-D scene doesn't mount
              (reduced motion / no WebGL): this link opens it directly. */}
          <a href="#doodle-wall">Open the doodle wall</a> to see the latest tiles and draw your own.
        </p>
      </section>

      <section aria-labelledby="resume-contact">
        <h2 id="resume-contact">Contact</h2>
        <ul>
          <li>
            Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
          <li>
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={contact.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={contact.cvUrl} download>
              Download CV (PDF)
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
