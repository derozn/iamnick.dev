import { Props as ImagePropTypes } from '#components/Image';

type Image = Omit<ImagePropTypes, 'loading'>;

export type Props = {
  title: string;
  date: string;
  image: Image;
  summary: string;
  reverse: boolean;
};

export type ArticleProps = {
  reverse: boolean;
};
