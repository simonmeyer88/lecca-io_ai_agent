import { CreateUserType } from '@/models/user-model';

import { ApiLibrary } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';
import { mockTokenSchema } from '../mock-models/mock-token-models';

export default class AuthService extends ApiLibraryHelper {
  protected schema = null;
  protected path = '/auth';
  protected serviceName = 'auth' as keyof ApiLibrary;

  async logout() {
    this.#deleteTokens();
  }

  async loginWithEmail({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const response = await this.apiFetch<{
      access_token: string;
      refresh_token: string;
    }>({
      path: `${this.path}/login`,
      httpMethod: 'post',
      data: {
        email,
        password,
      },
      mockConfig: {
        schema: mockTokenSchema,
      },
    });

    if (response.data) {
      this.#saveTokens(response.data);
    }

    return response;
  }

  /**
   * This doesn't actually log the user in. It validates the google token and then redirects to the verify-tokens page with a token that contains the access and refresh tokens.
   */
  async loginWithGmail({ token }: { token: string }) {
    await this.apiFetch<void>({
      path: `${this.path}/loginWithGoogle`,
      httpMethod: 'post',
      data: {
        token,
      },
      mockConfig: {
        schema: null,
      },
    });
  }

  async loginWithToken({ token }: { token: string }) {
    const response = await this.apiFetch<{
      access_token: string;
      refresh_token: string;
    }>({
      path: `${this.path}/login-with-token`,
      httpMethod: 'post',
      data: {
        token,
      },
      mockConfig: {
        schema: mockTokenSchema,
      },
    });

    if (response.data) {
      this.#saveTokens(response.data);
    }

    return response;
  }

  signupWithEmail<T = boolean>({ email, password, name }: CreateUserType) {
    return this.apiFetch<T>({
      path: `${this.path}/signup`,
      httpMethod: 'post',
      data: {
        email,
        name,
        password,
      },
      mockConfig: {
        schema: null,
      },
    });
  }

  sendForgotPasswordEmail<T = boolean>({ email }: { email: string }) {
    return this.apiFetch<T>({
      path: `${this.path}/send-forgot-password-email`,
      httpMethod: 'post',
      data: {
        email,
      },
      mockConfig: {
        schema: null,
      },
    });
  }

  resetPassword<T = boolean>({
    password,
    token,
  }: {
    password: string;
    token: string;
  }) {
    return this.apiFetch<T>({
      path: `${this.path}/reset-password`,
      httpMethod: 'post',
      data: {
        password,
        token,
      },
      mockConfig: {
        schema: null,
      },
    });
  }

  resendEmailVerification<T = boolean>({ email }: { email: string }) {
    return this.apiFetch<T>({
      path: `${this.path}/resend-email-verification`,
      httpMethod: 'post',
      data: {
        email,
      },
      mockConfig: {
        schema: null,
      },
    });
  }

  refreshToken() {
    return this._refreshToken();
  }

  validateEmailVerificationToken<
    T = {
      token: string;
    },
  >({ email, token }: { email: string; token: string }) {
    return this.apiFetch<T>({
      path: `${this.path}/validate-email-verification-token`,
      httpMethod: 'post',
      data: {
        email,
        token,
      },
      mockConfig: {
        schema: null,
      },
    });
  }

  #saveTokens = (tokens: { access_token: string; refresh_token?: string }) => {
    localStorage.setItem('accessToken', tokens.access_token);

    if (tokens.refresh_token) {
      localStorage.setItem('refreshToken', tokens.refresh_token);
    }
  };

  #deleteTokens = () => {
    localStorage.clear();
  };
}
