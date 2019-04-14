import sharp from 'sharp';
import path from 'path';
import { fileExists } from '@server/utils/file';

const generateThumbnail = async (req, res) => {
  const {
    query: { width = 20, height = 20 },
    params: { src, ext },
  } = req;

  const parsedWidth = parseInt(width, 10);
  const parsedHeight = parseInt(height, 10);

  const imagePath = path.resolve(__dirname, '../../../public/images', `${src}.${ext}`);

  try {
    await fileExists(imagePath);
  } catch (error) {
    return res.httpResponse.notFound({});
  }

  try {
    const resizedImage = await sharp(imagePath)
      .resize(parsedWidth, parsedHeight)
      .toFormat(ext)
      .toBuffer();

    return res.type(`image/${ext}`).send(resizedImage);
  } catch (error) {
    return res.httpResponse.badImplementation({ error, message: 'failed to resize image' });
  }
};

export default generateThumbnail;
