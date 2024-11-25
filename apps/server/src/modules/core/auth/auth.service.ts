import { MailService } from '@/modules/global/mail/mail.service';
import { VerifyUserEmailDto } from '@/modules/core/users/dto/verify-user-email.dto';
import { UsersService } from '@/modules/core/users/users.service';
import { WorkspacesService } from '@/modules/core/workspaces/workspaces.service';
import { PrismaService } from '@/modules/global/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginDto } from './dto/google-login-dto';
import { User } from '@prisma/client';
import { OperationsService } from '@/modules/global/operations/operations.service';
import { ServerConfig } from '@/config/server.config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private workspaceService: WorkspacesService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private mailService: MailService,
    private operationsService: OperationsService,
  ) {
    this.googleClient = new OAuth2Client(ServerConfig.GOOGLE_LOGIN_CLIENT_ID);
  }

  private googleClient: OAuth2Client;

  /**
   * Generates an access token and optionally a refresh token for the user.
   * The token payload contains all necessary information to identify the user
   * and their permissions for their active workspace.
   */
  async generateTokens(data: Pick<User, 'email'>, includeRefreshToken = true) {
    const user = await this.retrieveValidUserByEmail(data.email);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const tokens: { access_token: string; refresh_token?: string } = {
      access_token: this.jwtService.sign(payload),
    };

    if (includeRefreshToken) {
      tokens.refresh_token = this.jwtService.sign(payload, {
        expiresIn: '30d',
      });
    }

    return tokens;
  }

  /**
   * These tokens will be used for redirect. They will be placed in the url, so we don't want to expose the refresh token.
   * The client will need to send this token to get the access and refresh tokens.
   */
  async generateHiddenTokens(payload: object) {
    const token = this.jwtService.sign(payload, {
      expiresIn: '5m',
    });
    return token;
  }

  async decodeToken(payload: any) {
    const decodedToken = this.jwtService.verify(payload);
    return decodedToken;
  }

  /**
   * Verifies a refresh token and returns a new access token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const decodedToken = this.jwtService.verify(refreshToken);
      const newTokens = this.generateTokens(decodedToken, false);

      return newTokens;
    } catch {
      //this.jwtService.verify throws an TokenExpiredError or another error. We're going to catch it and
      //throw an UnauthorizedException error so that the client knows what to do.
      //We don't have a TokenExpiredError filter so it makes the server send a 500.
      throw new UnauthorizedException(
        'Invalid credentials. Please log in again.',
      );
    }
  }

  async findOrCreateUserByGoogleToken({ data }: { data: GoogleLoginDto }) {
    const payload = await this.verifyGoogleTokenAndReturnPayload({
      token: data.credential,
    });

    const email = payload.email;
    const name = payload.name;
    const imageUrl = payload.picture;

    let user = await this.userService.findOneByEmail({
      email,
      expansion: { emailVerifiedAt: true },
    });

    if (!user) {
      user = await this.userService.create({
        data: {
          email,
          name,
          rootProfileImageUrl: imageUrl,
        },
        forceVerifyEmail: true,
      });

      await this.workspaceService.create({
        createdByUserId: user.id,
        defaultCreatedWorkspace: true,
        data: {
          name: 'Personal Workspace',
        },
      });
    } else if (user.emailVerifiedAt === null) {
      //Logging in with google should verify the email if it's not verified.
      user = await this.verifyEmailByUserId(user.id);
    }

    return user;
  }

  async verifyGoogleTokenAndReturnPayload({ token }: { token: string }) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: ServerConfig.GOOGLE_LOGIN_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload;
  }

  /**
   * Retrieves a user by email and throws an UnauthorizedException if the user is not found.
   * Also throws an UnauthorizedException if the user's email is not verified.
   */
  async retrieveValidUserByEmail(email: string, ensureEmailVerified = true) {
    email = email.toLowerCase();
    const user = await this.userService.findOneByEmail({
      email,
      expansion: { emailVerifiedAt: true },
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (ensureEmailVerified && !user.emailVerifiedAt) {
      throw new UnauthorizedException('Email not verified');
    }

    return user;
  }

  async findActiveWorkspaceUserIdAndWorkspaceIdAndRolesForUser(userId: string) {
    return this.userService.findActiveWorkspaceUserIdAndWorkspaceIdAndRolesForUser(
      {
        userId,
      },
    );
  }

  /**
   * Retrieves a user by email and password and throws an UnauthorizedException if the user is not found.
   */
  async retrieveValidUserByEmailAndPassword(email: string, password: string) {
    email = email.toLowerCase();
    const user = await this.userService.findOneByEmailForPasswordValidation({
      email,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException();
    }

    //This isn't getting sent back but just deleting incase
    delete user.password;

    return user;
  }

  /**
   * Verifies the user email.
   */
  async verifyEmailByUserId(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
        name: true,
      },
    });

    const calculatedFirstName = user.name.split(' ')[0];
    const calculatedLastName = user.name.split(' ')[1];

    this.operationsService.onNewUser({
      email: user.email,
      firstName: calculatedFirstName,
      lastName: calculatedLastName,
      verifiedEmail: true,
    });

    return await this.userService.update<VerifyUserEmailDto>({
      userId,
      data: {
        emailVerifiedAt: new Date().toISOString(),
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });
  }

  async sendForgotPasswordEmail(email: string) {
    const payload = {
      email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const user = await this.retrieveValidUserByEmail(email, false);
    if (user) {
      if (user.email.endsWith('@test.com')) {
        console.info(
          'Reset password link:',
          `${ServerConfig.CLIENT_URL}/reset-password?token=${token}`,
        );
      } else {
        await this.mailService.sendMail({
          to: user.email,
          subject: `${ServerConfig.PLATFORM_NAME} - Forgot Password`,
          html: `Go to this link to reset your password: <a href="${ServerConfig.CLIENT_URL}/reset-password?token=${token}">Reset Password</a>`,
          text: `Go to this link to reset your password: ${ServerConfig.CLIENT_URL}/reset-password?token=${token}`,
        });
      }
      return true;
    }
    return true;
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) {
    const decodedToken = this.jwtService.verify(token);
    const email = decodedToken.email;

    const user = await this.retrieveValidUserByEmail(email, false);

    if (user) {
      const hashedPassword = bcrypt.hashSync(password, 10);

      await this.userService.update({
        userId: user.id,
        data: {
          password: hashedPassword,
        },
      });

      return true;
    }

    return true;
  }

  async sendVerificationEmail({ userId }: { userId: string }) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        deletedAt: true,
        emailVerifiedAt: true,
        emailVerificationToken: true,
        emailVerificationTokenExpiresAt: true,
        email: true,
      },
    });

    if (!user || user.deletedAt !== null) {
      throw new NotFoundException();
    }

    if (user.emailVerifiedAt !== null) {
      throw new UnauthorizedException('Email already verified');
    }

    if (
      user.emailVerificationToken &&
      user.emailVerificationTokenExpiresAt &&
      new Date(user.emailVerificationTokenExpiresAt) > new Date()
    ) {
      if (user.email.endsWith('@test.com')) {
        console.info('Email verification token:', user.emailVerificationToken);
      } else {
        await this.mailService.sendMail({
          to: user.email,
          subject: `${ServerConfig.PLATFORM_NAME} - Verify your email address`,
          html: `Enter this code to verify your email address: <h1>${user.emailVerificationToken}</h1>`,
          text: `Enter this code to verify your email address: ${user.emailVerificationToken}`,
        });
      }
      return true;
    } else {
      //Random 6 digit number
      const emailVerificationToken = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      //Expires in 15 minutes
      const emailVerificationTokenExpiresAt = new Date(
        new Date().getTime() + 15 * 60000,
      ).toISOString();

      const userToVerify = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          emailVerificationToken,
          emailVerificationTokenExpiresAt,
        },
        select: {
          email: true,
        },
      });

      if (user.email.endsWith('@test.com')) {
        console.info('Email verification token:', emailVerificationToken);
      } else {
        await this.mailService.sendMail({
          to: userToVerify.email,
          subject: `${ServerConfig.PLATFORM_NAME} - Verify your email address`,
          html: `Enter this code to verify your email address: <h1>${emailVerificationToken}</h1>`,
          text: `Enter this code to verify your email address: ${emailVerificationToken}`,
        });
      }

      return true;
    }
  }

  async validateVerificationToken({
    email,
    token,
  }: {
    email: string;
    token: string;
  }) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        emailVerificationToken: true,
        emailVerificationTokenExpiresAt: true,
      },
    });

    if (
      !user ||
      !user.emailVerificationToken ||
      !user.emailVerificationTokenExpiresAt ||
      new Date(user.emailVerificationTokenExpiresAt) < new Date() ||
      user.emailVerificationToken !== token
    ) {
      throw new UnauthorizedException('Invalid verification token');
    }

    return await this.verifyEmailByUserId(user.id);
  }
}
