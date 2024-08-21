import { TVGeneratedScreens } from '@derozn/tailwind-variants/dist/generated';

// Move this to a separate "utils" package
export const hasObjectGotKeys = <T extends {}>(data: T | null | undefined | {}): data is T =>
  !!data && Object.keys(data).length > 0;

// Move this to a separate "types" package
export type TGetObjectValuesType<T> = T extends object
  ? T[keyof T]
  : {
      [K in keyof T]: keyof T[K] extends object ? TGetObjectValuesType<T[K]> : K;
    };

export type TSrcProps = Record<string, string | object | boolean | number | undefined>;

export type TMapping<ResponsiveVariant, TargetVariant> = Array<{
  src: {
    [RV in keyof ResponsiveVariant]: TGetObjectValuesType<ResponsiveVariant[RV]>;
  };
  target: {
    [TV in keyof TargetVariant]: TGetObjectValuesType<TargetVariant[TV]>;
  };
}>;

function hasAllKeyValues(obj1: any, obj2: any) {
  return Object.keys(obj2).every((key) => obj1[key] === obj2[key]);
}

export type TResponsiveMapping<T = any> = Record<string, Partial<Record<TVGeneratedScreens, T>>>;

export type TCompoundTargetVariant<T = any> = {
  [Key in keyof T]: {
    [ScrKey in TVGeneratedScreens]?: TGetObjectValuesType<T[Key]>;
  };
};

export interface IOpts {
  /**
   * @desc Allows for finding all matches and merging them to the final output
   *       This does have a slight performance cost increase but allows for more flexible variant styling.
   *
   * @example Given a mapping of:
   *          [{
   *            src: { size: 'small' },
   *            target: { expand: true }
   *          }, {
   *            src: { size: 'small', isPro: true },
   *            target: { showProBanner: true }
   *          }]
   *
   *          And an input of:
   *          {
   *            size: { initial: 'small' }
   *            isPro: { initial: true }
   *          }
   *
   *          The final result will be:
   *          {
   *            initial: {
   *              expand: true,
   *              showProBanner: true
   *            }
   *          }
   *
   * @default false
   */
  cascade?: boolean;
}

/**
 * @example

  import { ITitleBlockProps } from '@iamnick/ui/src/components/molecules'

 * const props = { // Props from the main component
    size: { xs: 'card', md: 'hero', lg: 'card' },
    colour: { xs: 'secondary', md: 'primary', lg: 'secondary' },
  };

  const mapping = [
    {
      src: { colour: 'secondary', size: 'card' },
      target: { colour: 'tertiary' },
    },
    {
      src: { colour: 'tertiary', size: 'card' },
      target: { colour: 'tertiary' },
    },
  ],

  const targetVariants = compoundTargetVariants<Props, ITitleBlockProps>(mapping);

  ...

 * Then consume in your TailwindVariants component.

  const Foo = (props: TVVariants) => {
    const btnVariants = targetVariants(props) // { colour: { xs: 'tertiary', lg: 'tertiary' } }

    return (
      <Btn {...btnVariants} />
    )
  }
 */
export const compoundTargetVariants = <RV extends TSrcProps, TV extends object>(
  mapping: TMapping<RV, TV>,
  { cascade = false }: IOpts = {},
) => {
  return (srcVariant?: RV) => {
    if (!srcVariant) {
      return undefined;
    }

    const responsiveMapping = Object.entries(srcVariant).reduce<TResponsiveMapping<RV>>(
      (acc, [propKey, propValue]) => {
        const values = typeof propValue !== 'object' ? { initial: propValue } : propValue;

        return {
          ...acc,
          ...Object.entries(values).reduce((vacc, [screenSize, screenValue]) => {
            return {
              ...vacc,
              [screenSize]: {
                ...srcVariant,
                ...acc[screenSize],
                [propKey]: screenValue,
              },
            };
          }, {}),
        };
      },
      {},
    );

    return Object.entries(responsiveMapping).reduce((acc, [scrKey, scrValue]) => {
      let results: object | undefined;

      if (cascade) {
        results = mapping
          .filter(({ src }) => hasAllKeyValues(scrValue, src))
          .reduce((flatAcc, { target }) => ({ ...flatAcc, ...target }), {});
      } else {
        results = mapping.find(({ src }) => hasAllKeyValues(scrValue, src))?.target;
      }

      if (!hasObjectGotKeys(results)) {
        return acc;
      }

      return {
        ...acc,
        ...Object.entries(results).reduce((vacc, [tarKey, tarVal]) => {
          return {
            ...vacc,
            [tarKey]: {
              ...acc[tarKey as keyof typeof acc],
              [scrKey]: tarVal,
            },
          };
        }, {}),
      };
    }, {} as TCompoundTargetVariant<TV>);
  };
};
