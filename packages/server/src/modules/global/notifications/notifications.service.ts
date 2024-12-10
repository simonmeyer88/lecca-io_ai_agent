import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ServerConfig } from '../../../config/server.config';
import { NotificationCreateForWorkspaceUserPayload } from '../../../types/event-payloads/notification-create-payload.type';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create({ data }: { data: CreateNotificationDto }) {
    /**
     * Notification title max varchar is 100
     * Notification message max varchar is 255
     *
     * We will send the whole in the email, but for the notificaiton, we will truncate it to 100 chars
     */
    try {
      const notificationTitle =
        data.title.length > 100 ? `${data.title.slice(0, 100)}...` : data.title;

      const notificationMessage =
        data.message.length > 255
          ? `${data.message.slice(0, 255)}...`
          : data.message;

      await this.prisma.notification.create({
        data: {
          FK_workspaceUserId: data.workspaceUserId,
          title: notificationTitle,
          message: notificationMessage,
          link: data.link,
        },
        select: {
          id: true,
        },
      });

      ///////////EMAIL CONTENT//////////

      const workspaceUser = await this.prisma.workspaceUser.findUnique({
        where: {
          id: data.workspaceUserId,
        },
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      const fullLink = `${ServerConfig.CLIENT_URL}${data.link}`;

      const emailHtmlContent = `
  <p>${data.message || 'You have a new notification.'}</p>
  ${fullLink ? `<p>For more details, <a href="${fullLink}">click here</a>.</p>` : ''}
`;

      const emailTextContent = `
  ${data.message || 'You have a new notification.'}

  ${fullLink ? `For more details, please visit: ${fullLink}` : ''}
`;

      //TODO: Create notification preferences where we can slack users, email users, .etc according to their preferences.
      //For now, we will just email them.
      await this.mail.sendMail({
        to: workspaceUser.user.email,
        subject: data.title,
        html: emailHtmlContent,
        text: emailTextContent,
      });
    } catch (err) {
      //We always create notifications async but don't await. So we need to catch any errors instead of letting them bubble up.
      console.error(err);
    }
  }

  async findAllForWorkspaceUser({
    workspaceUserId,
  }: {
    workspaceUserId: string;
  }) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        FK_workspaceUserId: workspaceUserId,
      },
      select: {
        id: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true,
        link: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  }

  async markAsRead({ notificationId }: { notificationId: string }) {
    return await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsReadForWorkspaceUser({
    workspaceUserId,
  }: {
    workspaceUserId: string;
  }) {
    return await this.prisma.notification.updateMany({
      where: {
        FK_workspaceUserId: workspaceUserId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async delete({ notificationId }: { notificationId: string }) {
    await this.prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return true;
  }

  async checkNotificationBelongsToWorkspaceUser({
    workspaceUserId,
    notificationId,
  }: {
    workspaceUserId: string;
    notificationId: string;
  }) {
    const belongs = await this.prisma.notification.findFirst({
      where: {
        AND: [
          {
            id: notificationId,
          },
          {
            FK_workspaceUserId: workspaceUserId,
          },
        ],
      },
    });

    return !!belongs;
  }

  @OnEvent('notification.createForWorkspaceUser')
  async handleNotificationCreateForWorkspaceUserEvent(
    payload: NotificationCreateForWorkspaceUserPayload,
  ) {
    return await this.create({
      data: {
        title: payload.title,
        message: payload.message,
        link: payload.link,
        workspaceUserId: payload.workspaceUserId,
      },
    });
  }
}
