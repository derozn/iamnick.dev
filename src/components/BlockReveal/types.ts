export type Props = {
  backgroundColor: string;
  delay?: number;
  show?: boolean;
  reverse?: boolean;
};

export type ContainerProps = Props & {
  entered: boolean;
};
