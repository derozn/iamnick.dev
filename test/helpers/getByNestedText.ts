import { MatcherFunction } from '@testing-library/react';

type Query = (func: MatcherFunction) => HTMLElement;

export const getByNestedText = (query: Query, text: string): HTMLElement =>
  query((_, queryNode: HTMLElement) => {
    const hasText = (node: HTMLElement) => node.textContent === text;

    const childrenDontHaveText = Array.from(queryNode.children).every(
      (child) => !hasText(child as HTMLElement),
    );
    return hasText(queryNode) && childrenDontHaveText;
  });
