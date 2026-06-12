import { compoundTargetVariants, TMapping } from '../compoundTargetVariants';

describe(compoundTargetVariants.name, () => {
  describe('When the variant is not responsive', () => {
    it('returns correct structure', () => {
      const props = {
        size: 'card',
        colour: 'secondary',
      };

      const mapping: TMapping<typeof props, any> = [
        {
          src: { colour: 'secondary', size: 'card' },
          target: { colour: 'tertiary' },
        },
        {
          src: { colour: 'tertiary', size: 'card' },
          target: { colour: 'tertiary' },
        },
      ];

      expect(compoundTargetVariants(mapping)(props)).toEqual({
        colour: { initial: 'tertiary' },
      });
    });
  });

  describe('When the variant does not match any entry in the mapping', () => {
    it('returns correct structure', () => {
      const props = {
        size: 'card',
        colour: 'primary',
      };

      const mapping: TMapping<typeof props, any> = [
        {
          src: { colour: 'secondary', size: 'card' },
          target: { colour: 'tertiary' },
        },
        {
          src: { colour: 'tertiary', size: 'card' },
          target: { colour: 'tertiary' },
        },
      ];

      expect(compoundTargetVariants(mapping)(props)).toEqual({});
    });
  });

  describe('When the variant is responsive', () => {
    it('returns correct structure', () => {
      const props = {
        size: { xs: 'card', md: 'hero', lg: 'card' },
        colour: { xs: 'secondary', md: 'primary', lg: 'secondary' },
      };

      const mapping: TMapping<typeof props, any> = [
        {
          src: { colour: 'secondary', size: 'card' },
          target: { colour: 'tertiary' },
        },
        {
          src: { colour: 'tertiary', size: 'card' },
          target: { colour: 'tertiary' },
        },
      ];

      expect(compoundTargetVariants(mapping)(props)).toEqual({
        colour: { xs: 'tertiary', lg: 'tertiary' },
      });
    });
  });

  describe('When the variant is partially responsive', () => {
    it('returns correct structure', () => {
      const props = {
        size: 'card',
        colour: { xs: 'secondary', md: 'primary', lg: 'secondary' },
      };

      const mapping: TMapping<typeof props, any> = [
        {
          src: { colour: 'secondary', size: 'card' },
          target: { colour: 'tertiary' },
        },
        {
          src: { colour: 'tertiary', size: 'card' },
          target: { colour: 'tertiary' },
        },
      ];

      expect(compoundTargetVariants(mapping)(props)).toEqual({
        colour: { xs: 'tertiary', lg: 'tertiary' },
      });
    });
  });

  it('handles the case when a partial object match is correct', () => {
    const props = {
      size: { xs: 'card', md: 'hero', lg: 'card' },
      colour: { xs: 'secondary', md: 'primary', lg: 'tertiary' },
    } as {
      size?: { xs: 'card'; md: 'hero'; lg: 'card' };
      colour: { xs: 'secondary'; md: 'primary'; lg: 'tertiary' };
    };

    const mapping: TMapping<typeof props, any> = [
      {
        src: { colour: 'secondary' },
        target: { colour: 'primary' },
      },
      {
        src: { colour: 'tertiary', size: 'card' },
        target: { colour: 'tertiary' },
      },
    ];

    expect(compoundTargetVariants(mapping)(props)).toEqual({
      colour: {
        lg: 'tertiary',
        xs: 'primary',
      },
    });
  });
});
