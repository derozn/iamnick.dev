import fs from 'fs';

export const fileExists = path =>
  new Promise((resolve, reject) => {
    fs.access(path, fs.F_OK, err => {
      if (err) reject(err);
      else resolve();
    });
  });
