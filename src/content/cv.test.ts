import { describe, expect, it } from 'vitest';

import { contact, education, roles, sideProjects, skillGroups } from './cv';

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

describe('content/cv', () => {
  it('has at least one role', () => {
    expect(roles.length).toBeGreaterThan(0);
  });

  it('features exactly three roles for the 3-D islands', () => {
    expect(roles.filter((r) => r.featured)).toHaveLength(3);
  });

  it('gives every role a slug, company, title and non-empty highlights', () => {
    for (const role of roles) {
      expect(role.id, `${role.company} id`).toMatch(/^[a-z0-9-]+$/);
      expect(role.company.trim()).not.toBe('');
      expect(role.title.trim()).not.toBe('');
      expect(role.highlights.length, `${role.company} highlights`).toBeGreaterThan(0);
      expect(role.tech.length, `${role.company} tech`).toBeGreaterThan(0);
    }
  });

  it('uses valid YYYY-MM dates, with end >= start (or null for current)', () => {
    for (const role of roles) {
      expect(role.start, `${role.company} start`).toMatch(YEAR_MONTH);
      if (role.end !== null) {
        expect(role.end, `${role.company} end`).toMatch(YEAR_MONTH);
        expect(role.end >= role.start, `${role.company} end after start`).toBe(true);
      }
    }
  });

  it('lists roles newest-first by start date', () => {
    const starts = roles.map((r) => r.start);
    expect([...starts].sort((a, b) => b.localeCompare(a))).toEqual(starts);
  });

  it('exposes side projects with non-empty highlights', () => {
    expect(sideProjects.length).toBeGreaterThan(0);
    for (const project of sideProjects) {
      expect(project.name.trim()).not.toBe('');
      expect(project.highlights.length).toBeGreaterThan(0);
    }
  });

  it('groups skills without empty buckets', () => {
    expect(skillGroups.length).toBeGreaterThan(0);
    for (const group of skillGroups) {
      expect(group.skills.length).toBeGreaterThan(0);
    }
  });

  it('exposes valid contact links and education', () => {
    expect(contact.email).toContain('@');
    expect(contact.linkedin).toMatch(/^https:\/\//);
    expect(contact.github).toMatch(/^https:\/\//);
    expect(contact.cvUrl).toMatch(/\.pdf$/);
    expect(education.institution.trim()).not.toBe('');
  });
});
