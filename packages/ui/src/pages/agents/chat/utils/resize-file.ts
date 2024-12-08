import Resizer from 'react-image-file-resizer';

export const resizeFile = (file: FileList[number]) =>
  new Promise<string | Blob | File | ProgressEvent<FileReader>>((resolve) => {
    return Resizer.imageFileResizer(
      file,
      1000,
      1000,
      'JPEG',
      100,
      0,
      (uri) => {
        resolve(uri);
      },
      'blob',
    );
  });
