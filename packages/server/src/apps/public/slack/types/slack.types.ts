export type SlackWebhookBody = {
  team_id: string;
  event: {
    user: string;
    type: 'message';
    team: string;
    channel_type: 'channel';
  };
};
