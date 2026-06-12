import { render, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { HolyGrail, IHolyGrailProps } from './HolyGrail';

const setup = (props: PropsWithChildren<IHolyGrailProps>) => {
  return render(<HolyGrail {...props} />);
};

describe(HolyGrail.name, () => {
  describe('When rendering the holy grail component', () => {
    describe('And a header prop is passed', () => {
      it('renders component', () => {
        setup({ header: <div>header</div> });

        expect(screen.getByText('header')).toBeVisible();
      });
    });

    describe('And a footer prop is passed', () => {
      it('renders component', () => {
        setup({ footer: <div>footer</div> });

        expect(screen.getByText('footer')).toBeVisible();
      });
    });

    describe('And children are passed', () => {
      it('renders childen', () => {
        setup({ children: <div>i am child</div> });

        expect(screen.getByText('i am child')).toBeVisible();
      });
    });
  });
});
