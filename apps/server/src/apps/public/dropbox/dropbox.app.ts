import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { DropboxCreateFolder } from './actions/create-folder.action';
import { GetTemporaryLink } from './actions/get-file-link.action';
import { DropboxListFolderContents } from './actions/list-folder-contents.action';
import { DropboxListFolders } from './actions/list-folders.action';
import { DropboxSearch } from './actions/search.action';
import { DropboxOAuth2 } from './connections/dropbox.oauth2';

export class Dropbox extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'dropbox';
  name = 'Dropbox';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Dropbox is a cloud-based file storage service that allows users to save files online and sync them across devices.';
  isPublished = true;

  connections(): Connection[] {
    return [new DropboxOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new DropboxSearch({ app: this }),
      new DropboxListFolderContents({ app: this }),
      new GetTemporaryLink({ app: this }),
      new DropboxCreateFolder({ app: this }),
      new DropboxListFolders({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  dynamicListFolders(): InputConfig {
    return {
      id: 'path',
      label: 'Folder Path',
      description:
        'The path of the folder to list contents from. Leave empty if you want to retrieve the root folder',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = 'https://api.dropboxapi.com/2/files/list_folder';

        const data = {
          path: '',
          recursive: true, // Adjust this if you want recursive listing
        };

        const result = await this.http.loggedRequest({
          method: 'POST',
          url,
          data,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        // Filter only folder entries
        if (result?.data) {
          const folderEntries = result.data.entries.filter(
            (entry: any) => entry['.tag'] === 'folder',
          );
          return [
            { value: '', label: 'Root' },
            ...folderEntries.map((folder: any) => ({
              value: folder.path_lower,
              label: folder.name,
            })),
          ];
        } else {
          throw new Error('Failed to list folders');
        }
      },
    };
  }
}
