import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { LinkedinOAuth2 } from './connections/linkedin.oauth2';
import { CreateTextPost } from './actions/create-text-post.action';
import { InputConfig } from '@/apps/lib/input-config';
import { CreateOrganizationTextPost } from './actions/create-organization-text-post.action';
import { CreateOrganizationImagePost } from './actions/create-organization-image-post.action';
import { CreateImagePost } from './actions/create-image-post.action';
import { ServerConfig } from '@/config/server.config';

export class Linkedin extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'linkedin';
  name = 'Linkedin';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'LinkedIn is a professional networking platform that connects professionals around the world.';
  isPublished = true;

  connections(): Connection[] {
    return [new LinkedinOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new CreateTextPost({ app: this }),
      new CreateImagePost({ app: this }),
      new CreateOrganizationTextPost({ app: this }),
      new CreateOrganizationImagePost({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [
      // Add your trigger instances here
    ];
  }

  async getPersonId({
    accessToken,
    workspaceId,
  }: {
    accessToken: string;
    workspaceId: string;
  }): Promise<string> {
    const url = 'https://api.linkedin.com/v2/me';

    const response = await this.http.loggedRequest({
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
  }

  dynamicSelectOrganization(): InputConfig {
    return {
      id: 'organizationId',
      label: 'Organization',
      description: 'Select an organization',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url =
          'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee';

        // Step 1: Get the list of organizations
        const response = await this.http.loggedRequest({
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

            const orgResponse = await this.http.loggedRequest({
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
    };
  }

  async uploadMediaImage({
    mediaUrl,
    urn,
    accessToken,
    workspaceId,
  }: {
    mediaUrl: string;
    urn: string;
    accessToken: string;
    workspaceId: string;
  }) {
    // Step 1: Initialize the upload
    const { uploadUrl, imageId } = await this.#initializeUpload({
      accessToken,
      urn,
      workspaceId,
    });

    // Step 2: Upload the image
    await this.#handleUpload({
      uploadUrl,
      mediaUrl,
      accessToken,
    });

    return imageId;
  }

  async #handleUpload({
    uploadUrl,
    mediaUrl,
    accessToken,
  }: {
    uploadUrl: string;
    mediaUrl: string;
    accessToken: string;
  }) {
    const imageResponse = await this.fileHandler.downloadFile({
      url: mediaUrl,
      dataType: 'blob',
    });

    const uploadResponse = await this.fileHandler.uploadMultiPartFormData({
      url: uploadUrl,
      blob: imageResponse.data as Blob,
      filename: 'image',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return uploadResponse.data;
  }

  async #initializeUpload({
    accessToken,
    urn,
    workspaceId,
  }: {
    accessToken: string;
    urn: string;
    workspaceId: string;
  }) {
    const uploadUrlResponse = await this.http.loggedRequest({
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
  }
}
