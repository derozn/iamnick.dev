import { profile, roles, sideProjects, skillGroups, contact, type Role } from '@/content/cv';
import { formatYearMonth } from '@/lib/formatDate';

/** Small heading kicker shared across panels. */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span aria-hidden="true" className="h-px w-6 shrink-0 bg-accent/70" />
      <p className="font-expressive text-[12px] font-semibold uppercase tracking-widest text-accent">
        {children}
      </p>
    </div>
  );
}

function TechChip({ label }: { label: string }) {
  return <li className="hud-chip px-3 py-1 font-functional text-[12px] text-accent/90">{label}</li>;
}

function Intro() {
  return (
    <>
      <Kicker>{profile.location}</Kicker>
      <h2 className="font-expressive text-[30px] font-semibold leading-tight text-text-primary md:text-[40px]">
        {profile.name}
      </h2>
      <p className="mt-2 font-expressive text-[18px] font-semibold text-accent md:text-[20px]">
        {profile.headline}
      </p>
      <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-text-primary/85">
        {profile.shortBio}
      </p>
    </>
  );
}

function About() {
  return (
    <>
      <Kicker>The person</Kicker>
      <h2 className="font-expressive text-[28px] font-semibold text-text-primary md:text-[34px]">
        About
      </h2>
      <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-text-primary/85">
        {profile.shortBio}
      </p>
      <div className="mt-8 space-y-6">
        {skillGroups.map((g) => (
          <div key={g.label}>
            <h3 className="mb-3 font-expressive text-[13px] font-semibold uppercase tracking-widest text-accent/70">
              {g.label}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {g.skills.map((s) => (
                <li
                  key={s}
                  className="hud-chip px-3 py-1 font-functional text-[13px] text-text-primary/80"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

function RolePanel({ role }: { role: Role }) {
  const dateRange = `${formatYearMonth(role.start)} – ${formatYearMonth(role.end)}`;
  return (
    <>
      <Kicker>
        {role.location} · {dateRange}
      </Kicker>
      <h2 className="font-expressive text-[28px] font-semibold leading-tight text-text-primary md:text-[34px]">
        {role.company}
      </h2>
      <p className="mt-1 font-expressive text-[16px] font-semibold text-accent/80 md:text-[18px]">
        {role.title}
      </p>
      <p className="mt-5 text-[14px] leading-relaxed text-text-primary/75">{role.blurb}</p>
      <ul className="mt-5 space-y-3">
        {role.highlights.map((h, i) => (
          <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-text-primary/85">
            <span className="mt-[7px] h-1 w-3 shrink-0 bg-accent/80" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-2">
        {role.tech.map((t) => (
          <TechChip key={t} label={t} />
        ))}
      </ul>
    </>
  );
}

function Projects() {
  return (
    <>
      <Kicker>Side work</Kicker>
      <h2 className="font-expressive text-[28px] font-semibold text-text-primary md:text-[34px]">
        Projects
      </h2>
      <div className="mt-6 space-y-8">
        {sideProjects.map((p) => (
          <article key={p.id} aria-label={p.name}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-expressive text-[20px] font-semibold text-text-primary">
                {p.name}
              </h3>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-functional text-[12px] text-accent hover:text-accent/70"
                >
                  Visit ↗
                </a>
              )}
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-text-primary/75">{p.blurb}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <TechChip key={t} label={t} />
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

function Contact() {
  const links = [
    { href: `mailto:${contact.email}`, label: 'Email', detail: contact.email },
    {
      href: contact.linkedin,
      label: 'LinkedIn',
      detail: 'linkedin.com/in/nickderozarieux',
      ext: true,
    },
    { href: contact.github, label: 'GitHub', detail: 'github.com/derozn', ext: true },
    { href: contact.cvUrl, label: 'Download CV', detail: 'PDF résumé', dl: true },
  ];
  return (
    <>
      <Kicker>Let&apos;s talk</Kicker>
      <h2 className="font-expressive text-[28px] font-semibold text-text-primary md:text-[34px]">
        Get in touch
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              {...(l.ext && { target: '_blank', rel: 'noopener noreferrer' })}
              {...(l.dl && { download: true })}
              className="hud-button flex min-h-[56px] flex-col justify-center px-5 py-3"
            >
              <span className="font-expressive text-[15px] font-semibold text-text-primary">
                {l.label}
              </span>
              <span className="font-functional text-[12px] text-text-primary/60">{l.detail}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Renders a CV section by its attraction `section` key. */
export function SectionContent({ section }: { section: string }) {
  if (section === 'intro') return <Intro />;
  if (section === 'about') return <About />;
  if (section === 'projects') return <Projects />;
  if (section === 'contact') return <Contact />;
  if (section.startsWith('role:')) {
    const role = roles.find((r) => r.id === section.slice(5));
    if (role) return <RolePanel role={role} />;
  }
  return null;
}
