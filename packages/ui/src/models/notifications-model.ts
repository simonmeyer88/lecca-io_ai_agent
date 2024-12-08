import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().transform((val) => {
    return new Date(val);
  }),
  title: z.string(),
  message: z.string(),
  link: z.string().optional(),
  isRead: z.boolean(),
});
export type Notification = z.infer<typeof notificationSchema>;
