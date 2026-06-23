import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { contact } from '@/content/cv';

import { ContactSection } from './ContactSection';

describe('organisms/ContactSection', () => {
  it('renders the contact links from cv data with correct hrefs', () => {
    render(<ContactSection />);

    const nav = screen.getByRole('navigation', { name: /contact links/i });
    const hrefs = Array.from(nav.querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(hrefs).toContain(`mailto:${contact.email}`);
    expect(hrefs).toContain(contact.linkedin);
    expect(hrefs).toContain(contact.github);
    expect(hrefs).toContain(contact.cvUrl);
  });

  it('marks the CV link as a download', () => {
    render(<ContactSection />);

    const cvLink = screen
      .getByRole('navigation', { name: /contact links/i })
      .querySelector(`a[href="${contact.cvUrl}"]`);

    expect(cvLink).toHaveAttribute('download');
  });
});
