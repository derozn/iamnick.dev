export const getImageData = image => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');

  ctx.scale(1, -1);
  ctx.drawImage(image, 0, 0, image.width, image.height * -1);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};
