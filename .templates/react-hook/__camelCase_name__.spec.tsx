import { renderHook } from '@testing-library/react-hooks';

import {{camelCase name}} from './{{camelCase name}}';

describe('hooks/{{camelCase name}}', () => {
  it('works', () => {
    const { result } = renderHook(() => {{camelCase name}}());

    expect(result.current).toBe(true);
  });
});
