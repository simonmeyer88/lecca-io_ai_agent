import React from 'react';

import { getUploadUrlForTempFile } from '../utils/get-upload-url';
import { resizeFile } from '../utils/resize-file';

export function UploadImageForMessageForm({
  children,
  setImageData,
}: {
  children: React.ReactNode;
  setImageData: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const files = inputRef.current?.files;
    if (!files || files.length === 0) {
      return;
    }

    let file = files[0] as any;

    //Resize file if it's not a svg
    if (files[0].type !== 'image/svg+xml') {
      file = await resizeFile(file);
    }

    const uploadUrlData = await getUploadUrlForTempFile({
      fileName: files[0].name,
    });
    if (!uploadUrlData) {
      return;
    }

    const { presignedPostData, imageUrl } = uploadUrlData;

    try {
      const formData = new FormData();
      Object.entries(presignedPostData.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      const result = await fetch(presignedPostData.url, {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) {
        //Toast
      } else {
        setImageData((prev) => {
          return [...prev, imageUrl!];
        });
      }
    } catch {
      //Toast
    }
  };

  return (
    <div onClick={() => inputRef.current?.click()}>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleUpload}
        //Only allow images
        accept="image/*"
      />
      {children}
    </div>
  );
}
