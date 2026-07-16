import type { ReactNode } from 'react';

import type { AdminIdentity } from '@/lib/supabase/adminAuth';

/**
 * The carny's counter shell — shared by every /admin route: letterpress
 * header, the counter's two tabs (queue + wall), and the three
 * non-moderator identity states. Children render only for the carny.
 * Server component; identity is resolved by the page and passed in so each
 * route stays one getAdminIdentity() call.
 */

const TABS = [
  { id: 'queue', href: '/admin', label: 'the queue' },
  { id: 'wall', href: '/admin/wall', label: 'the wall' },
] as const;

export type AdminTab = (typeof TABS)[number]['id'];

export function AdminGate({
  identity,
  authError = false,
  tab,
  title,
  children,
}: {
  identity: AdminIdentity;
  authError?: boolean;
  tab: AdminTab;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background-primary px-4 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <p className="font-fell-sc text-[13px] tracking-[0.22em] text-brass-text">
            the carny&rsquo;s counter
          </p>
          <h1 className="font-rye letterpress mt-2 text-[34px] text-ink">{title}</h1>
        </header>

        {identity.kind === 'unconfigured' && (
          <CounterCard>
            <p className="font-fell text-[15px] leading-relaxed text-ink/90">
              The counter is dark — no Supabase environment is configured, so the site is running in
              stub mode and there is no real queue to review.
            </p>
          </CounterCard>
        )}

        {identity.kind === 'anonymous' && (
          <CounterCard>
            {authError && (
              <p className="font-fell-sc mb-4 text-[13px] tracking-[0.06em] text-accent">
                Sign-in didn&rsquo;t complete — try again.
              </p>
            )}
            <p className="font-fell text-[15px] leading-relaxed text-ink/90">
              Carny only past this point.
            </p>
            <a
              href="/api/admin/auth/login"
              className="paper-button mt-6 inline-block rounded-[3px] px-6 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
            >
              Sign in with Google
            </a>
          </CounterCard>
        )}

        {identity.kind === 'denied' && (
          <CounterCard>
            <p className="font-fell text-[15px] leading-relaxed text-ink/90">
              <span className="font-fell-sc">{identity.email}</span> isn&rsquo;t the carny — this
              counter serves exactly one person.
            </p>
            <SignOutButton className="paper-button mt-6 rounded-[3px] px-6 py-3 font-fell-sc text-[15px] tracking-[0.06em]" />
          </CounterCard>
        )}

        {identity.kind === 'moderator' && (
          <>
            <div className="mt-4 flex items-center justify-center gap-3">
              <p className="font-fell text-[13px] italic text-ink-soft/80">{identity.email}</p>
              <SignOutButton className="font-fell-sc text-[12px] tracking-[0.06em] text-brass-text underline-offset-2 hover:underline" />
            </div>
            <nav aria-label="Counter views" className="mt-5 flex justify-center gap-2">
              {TABS.map((t) =>
                t.id === tab ? (
                  <span
                    key={t.id}
                    aria-current="page"
                    className="paper-button rounded-[3px] px-4 py-2 font-fell-sc text-[13px] tracking-[0.06em] opacity-60"
                  >
                    {t.label}
                  </span>
                ) : (
                  <a
                    key={t.id}
                    href={t.href}
                    className="paper-button rounded-[3px] px-4 py-2 font-fell-sc text-[13px] tracking-[0.06em]"
                  >
                    {t.label}
                  </a>
                ),
              )}
            </nav>
            {children}
          </>
        )}
      </div>
    </main>
  );
}

/** The counter's card shell — one place for the ticket-frame chrome. */
export function CounterCard({ children }: { children: ReactNode }) {
  return (
    <section className="ticket-frame halftone mt-8 rounded-[5px] p-6 text-center">
      {children}
    </section>
  );
}

function SignOutButton({ className }: { className: string }) {
  return (
    <form action="/api/admin/auth/logout" method="post">
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
