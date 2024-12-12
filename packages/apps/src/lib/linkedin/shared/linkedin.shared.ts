import {
  InjectedServices,
  createDynamicSelectInputField,
} from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectOrganization: createDynamicSelectInputField({
      id: 'organizationId',
      label: 'Organization',
      description: 'Select an organization',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url =
          'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee';

        // Step 1: Get the list of organizations
        const response = await http.request({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
          workspaceId,
        });

        const organizations = response.data.elements;

        if (!organizations || organizations.length === 0) {
          throw new Error('No organizations found for this user');
        }

        // Step 2: Fetch organization names
        const organizationDetails = await Promise.all(
          organizations.map(async (organization: any) => {
            const orgId = organization.organizationalTarget.split(':').pop(); // Extract organization ID from URN
            const orgUrl = `https://api.linkedin.com/v2/organizations/${orgId}`;

            const orgResponse = await http.request({
              method: 'GET',
              url: orgUrl,
              headers: {
                Authorization: `Bearer ${connection.accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json',
              },
              workspaceId,
            });

            return orgResponse?.data
              ? {
                  label: orgResponse.data.localizedName, // Use the organization's localized name
                  value: orgId,
                }
              : null;
          }),
        );

        // Filter out any null values in case of failed organization fetches
        return organizationDetails.filter((org) => org !== null);
      },
      required: {
        missingMessage: 'Please select an organization',
        missingStatus: 'warning',
      },
    }),
  },
  getPersonId: async ({
    accessToken,
    workspaceId,
    http,
  }: {
    accessToken: string;
    workspaceId: string;
    http: InjectedServices['http'];
  }): Promise<string> => {
    const url = 'https://api.linkedin.com/v2/me';

    const response = await http.request({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      workspaceId,
    });

    const personId = response.data.id;

    if (!personId) {
      throw new Error('Person ID not found');
    }

    return personId;
  },
  uploadMediaImage: async ({
    mediaUrl,
    urn,
    accessToken,
    workspaceId,
    http,
    fileHandler,
  }: {
    mediaUrl: string;
    urn: string;
    accessToken: string;
    workspaceId: string;
    http: InjectedServices['http'];
    fileHandler: InjectedServices['fileHandler'];
  }) => {
    // Step 1: Initialize the upload
    const { uploadUrl, imageId } = await shared.initializeUpload({
      accessToken,
      urn,
      workspaceId,
      http,
    });

    // Step 2: Upload the image
    await shared.handleUpload({
      uploadUrl,
      mediaUrl,
      accessToken,
      fileHandler,
    });

    return imageId;
  },
  handleUpload: async ({
    uploadUrl,
    mediaUrl,
    accessToken,
    fileHandler,
  }: {
    uploadUrl: string;
    mediaUrl: string;
    accessToken: string;
    fileHandler: InjectedServices['fileHandler'];
  }) => {
    const imageResponse = await fileHandler.downloadFile({
      url: mediaUrl,
      dataType: 'blob',
    });

    const uploadResponse = await fileHandler.uploadMultiPartFormData({
      url: uploadUrl,
      blob: imageResponse.data as Blob,
      filename: 'image',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return uploadResponse.data;
  },
  initializeUpload: async ({
    accessToken,
    urn,
    workspaceId,
    http,
  }: {
    accessToken: string;
    urn: string;
    workspaceId: string;
    http: InjectedServices['http'];
  }) => {
    const uploadUrlResponse = await http.request({
      method: 'POST',
      url: 'https://api.linkedin.com/rest/images?action=initializeUpload',
      data: {
        initializeUploadRequest: {
          owner: `urn:li:${urn}`,
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Linkedin-Version': 202408,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      workspaceId,
    });

    if (!uploadUrlResponse.data?.value?.uploadUrl) {
      throw new Error('Upload url not found');
    } else if (!uploadUrlResponse.data?.value?.image) {
      throw new Error('Image ID not returned in upload init.');
    }

    return {
      uploadUrl: uploadUrlResponse.data.value.uploadUrl,
      imageId: uploadUrlResponse.data.value.image,
    };
  },
};
