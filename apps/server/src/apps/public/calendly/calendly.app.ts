import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { ListOrganizationEvents } from './actions/list-organization-events.action';
import { ListUserEvents } from './actions/list-user-events.action';
import { CalendlyOAuth2 } from './connections/calendly.oauth2';

export class Calendly extends App {
  id = 'calendly';
  name = 'Calendly';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = 'Calendly is a modern scheduling platform.';
  isPublished = true;

  connections(): Connection[] {
    return [new CalendlyOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new ListUserEvents({ app: this }),
      new ListOrganizationEvents({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  dynamicGetUserURIs(): InputConfig {
    return {
      id: 'userUri',
      label: 'User URI',
      description: 'The User URI of the user you want to list events for',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const meUrl = `https://api.calendly.com/users/me`;

        const me = await this.http.loggedRequest({
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

        const users = await this.http.loggedRequest({
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
    };
  }

  dynamicGetOrganizationURIs(): InputConfig {
    return {
      id: 'organizationUri',
      label: 'Organization URI',
      description:
        'The Organization URI of the organization you want to list events for',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const meUrl = `https://api.calendly.com/users/me`;

        const me = await this.http.loggedRequest({
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

        const organization = await this.http.loggedRequest({
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
    };
  }
}
