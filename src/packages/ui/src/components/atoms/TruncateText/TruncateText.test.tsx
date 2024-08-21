import { render } from '@testing-library/react';

import { TruncateText, ITruncateText } from './TruncateText';

const setup = (props: ITruncateText) => {
  return render(<TruncateText {...props} />);
};

const lineCount = [1, 2, 3] as const;

describe(TruncateText.name, () => {
  describe('When rendering variants', () => {
    describe.each(lineCount)('and the line count %s', (lines) => {
      it('renders correctly', () => {
        const wrapper = setup({
          lines,
        });
        expect(wrapper.container.firstChild).toMatchSnapshot();
      });
    });
  });
});
