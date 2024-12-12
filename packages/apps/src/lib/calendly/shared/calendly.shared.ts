import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectOrganizationsURIs: createDynamicSelectInputField({
      id: 'organizationUri',
      label: 'Organization URI',
      description:
        'The Organization URI of the organization you want to list events for',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const meUrl = `https://api.calendly.com/users/me`;

        const me = await http.request({
          method: 'GET',
          url: meUrl,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        const currentOrganizationForUser =
          me.data.resource?.current_organization;

        if (!currentOrganizationForUser) {
          return [];
        }

        const organization = await http.request({
          method: 'GET',
          url: currentOrganizationForUser,
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        return [
          {
            value: currentOrganizationForUser,
            label: organization.data?.resource?.name,
          },
        ];
      },
    }),
    dynamicSelectUser: createDynamicSelectInputField({
      id: 'userUri',
      label: 'User URI',
      description: 'The User URI of the user you want to list events for',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const meUrl = `https://api.calendly.com/users/me`;

        const me = await http.request({
          method: 'GET',
          url: meUrl,
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        const currentOrganizationForUser =
          me.data.resource?.current_organization;

        if (!currentOrganizationForUser) {
          return [];
        }

        const usersUrl = `https://api.calendly.com/organization_memberships?organization=${currentOrganizationForUser}`;

        const users = await http.request({
          url: usersUrl,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        return (
          users.data?.collection?.map((item: any) => {
            return {
              value: item.user.uri, // Use the correct key for ID
              label: item.user.name, // Use the correct key for organization name
            };
          }) ?? []
        );
      },
    }),
  },
};
