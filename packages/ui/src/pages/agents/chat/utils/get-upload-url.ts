import { api } from '@/api/api-library';

export const getUploadUrlForTempFile = async ({
  fileName,
}: {
  fileName: string;
}) => {
  const presignedUploadUrl =
    await api.workspaces.getPresignedPostUrlForTempFile({
      fileName: fileName,
    });

  if (presignedUploadUrl.data) {
    const imageUrl =
      presignedUploadUrl.data!.presignedPostData.url +
      presignedUploadUrl.data!.presignedPostData.fields.key;

    return {
      presignedPostData: presignedUploadUrl.data.presignedPostData,
      imageUrl,
    };
  }

  return null;
};
