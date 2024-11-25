export type NotificationCreateForWorkspaceUserPayload = {
  title: string;
  message: string;
  link?: string;
  workspaceUserId: string;
};
