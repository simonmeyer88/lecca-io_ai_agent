import { SSM } from '@aws-sdk/client-ssm';
import * as dotenv from 'dotenv';

import { ServerConfig } from './server.config';

dotenv.config();

/**
 * This file is responsible for loading the ServerConfig from the environment variables.
 *
 * If you have a AWS Parameter Store setup, it will load the configuration from there.
 * It will use the path /{ENVIRONMENT}/server-core/{key} to load the configuration.
 *
 * If you do not have a AWS Parameter Store setup, it will load the configuration from the local environment variables.
 */

// Ensure the ENVIRONMENT variable is set
const ENVIRONMENT = process.env.ENVIRONMENT;
if (!ENVIRONMENT) {
  throw new Error(
    'The ENVIRONMENT environment variable is required but was not specified. Must be development or production',
  );
}

/**
 * Function to load configurations from AWS Parameter Store if it exists.
 * If not, iterate over the process.env object and set the ServerConfig values accordingly.
 */
async function loadConfigurationsFromParameterStore(
  paginationToken?: string,
): Promise<void> {
  const {
    PARAM_STORE_ACCESS_KEY,
    PARAM_STORE_SECRET_ACCESS_KEY,
    PARAM_STORE_REGION,
  } = process.env;

  if (
    !PARAM_STORE_ACCESS_KEY ||
    !PARAM_STORE_SECRET_ACCESS_KEY ||
    !PARAM_STORE_REGION
  ) {
    /**
     * If not using parameter store, we'll use the local environment variables instead.
     * We need to iterate over the process.env object and set the ServerConfig values accordingly.
     */

    if (process.env) {
      Object.entries(process.env).forEach(([key, value]) => {
        setServerConfigProperty({
          key,
          value,
        });
      });
    }
  } else {
    const ssmClient = new SSM({
      region: PARAM_STORE_REGION,
      credentials: {
        accessKeyId: PARAM_STORE_ACCESS_KEY,
        secretAccessKey: PARAM_STORE_SECRET_ACCESS_KEY,
      },
    });

    const path = `/${ENVIRONMENT}/server-core`;

    const params = {
      Path: path,
      Recursive: true,
      WithDecryption: true,
      NextToken: paginationToken,
    };

    try {
      const result = await ssmClient.getParametersByPath(params);

      if (result.Parameters) {
        for (const parameter of result.Parameters) {
          const key = parameter.Name?.split('/').pop();
          const value = parameter.Value as string;
          if (key && value !== undefined) {
            /**
             * 1. Sets the process.env variables to the value of the parameter store
             */
            process.env[key] = parameter.Value;

            /**
             * 2. Sets the ServerConfig variables to the value of the parameter store.
             */
            setServerConfigProperty({
              key,
              value,
            });
          }
        }
      }

      // If there are more parameters to load, recursively load them
      if (result.NextToken) {
        await loadConfigurationsFromParameterStore(result.NextToken);
      }
    } catch (error) {
      throw new Error(
        `Failed to load configuration from parameter store: ${error}`,
      );
    }
  }
}

function setServerConfigProperty({
  key,
  value,
}: {
  key: string;
  value: string;
}) {
  /**
   * Some ServerConfig values are nested and need to be set accordingly.
   * We do this because we never directly access process.env in the codebase, only the ServerConfig
   * so it's nice to have some values nested.
   */

  if (key.startsWith('INTEGRATION_')) {
    /**
     * All integrations need to be prefixed with 'INTEGRATION_'.
     * For example, 'INTEGRATION_GMAIL_CLIENT_ID'.
     */

    const integrationName = key.split('_').slice(1).join('_');

    if (integrationName) {
      (ServerConfig['INTEGRATIONS'] as Record<string, string>)[
        integrationName
      ] = value;
    }
  } else if (key.startsWith('MAIL_')) {
    /**
     * All mail options need to be prefixed with 'MAIL_'.
     */
    (ServerConfig['MAIL_OPTIONS'] as Record<string, string>)[key] = value;
  } else {
    (ServerConfig as Record<string, any>)[key] = value as any;
  }
}

/**
 * This is only used when using AWS Parameter Store.
 *
 * No development integration keys are saved in the parameter store. So you must provide those environment variables
 * in your local .env file. This function will set the server config values from your local .env file for any
 * values that didn't exist in the parameter store.
 *
 * We will iterate over the ServerConfig object and set the default values for any missing values.
 */
function setServerConfigDefaultsForMissingValues() {
  Object.entries(ServerConfig).forEach(([key, value]) => {
    if (key === 'INTEGRATIONS') {
      const integrations = ServerConfig['INTEGRATIONS'] as Record<
        string,
        string
      >;

      Object.entries(integrations).forEach(
        ([integrationKey, integrationValue]) => {
          if (integrationValue === undefined) {
            const envValue = process.env[`INTEGRATION_${integrationKey}`];
            if (envValue !== undefined) {
              setServerConfigProperty({
                key: `INTEGRATION_${integrationKey}`,
                value: envValue,
              });
            }
          }
        },
      );
    } else {
      if (value === undefined) {
        const envValue = process.env[key];
        if (envValue !== undefined) {
          setServerConfigProperty({
            key,
            value: envValue,
          });
        }
      }
    }
  });
}

/**
 * These are the necessary value required to run the server
 * and get basic functionality working.
 *
 * If you want certain features to work, make sure to add the necessary values to the ServerConfig.
 * View Discovery Service (discovery.service.ts) to view the requirements for certain features.
 */
function verifyNecessaryServerConfigValuesAreSet() {
  const necessaryValues: (keyof typeof ServerConfig)[] = [
    'ENVIRONMENT',
    'DATABASE_URL',
    'SERVER_URL',
    'CLIENT_URL',
    'PORT',
    'AUTH_JWT_SECRET',
    'APP_OAUTH_CALLBACK_STATE_SECRET',
    'CRYPTO_ENCRYPTION_KEY',
  ];

  const errors: string[] = [];

  necessaryValues.forEach((value) => {
    if (ServerConfig[value] === undefined) {
      errors.push(`${value}`);
    } else if (
      value === 'CRYPTO_ENCRYPTION_KEY' &&
      ServerConfig[value].length !== 32
    ) {
      errors.push(`${value} (must be 32 characters long)`);
    }
  });

  if (errors.length > 0) {
    console.error(
      `\nFailed to initialize server configuration: You are missing ${errors.length} environment variable${errors.length > 1 ? 's' : ''} or there are invalid variables:`,
    );
    console.error(`\n${errors.join(',\n')}`);
    console.error(
      '\nNote that these are the minimium required values to run the server. Certain features may require additional environment variables.',
    );

    process.exit(1);
  }
}

// Function to initialize the server configuration
async function initServerConfiguration(): Promise<void> {
  await loadConfigurationsFromParameterStore();
  setServerConfigDefaultsForMissingValues();
  verifyNecessaryServerConfigValuesAreSet();
}

// Export the ServerConfiguration for use in other modules
export { initServerConfiguration };
