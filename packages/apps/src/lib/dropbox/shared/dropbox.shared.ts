import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicListFolders: createDynamicSelectInputField({
      id: 'path',
      label: 'Folder Path',
      description:
        'The path of the folder to list contents from. Leave empty if you want to retrieve the root folder',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = 'https://api.dropboxapi.com/2/files/list_folder';

        const data = {
          path: '',
          recursive: true, // Adjust this if you want recursive listing
        };

        const result = await http.request({
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
    }),
  },
};
