export const ServerConfig = {
  /**
   * Choose between 'development' or 'production'.
   * At the moment this is used for the following:
   *  1. Changes the callback URL for OAuth integrations.
   *  2. Changes the directory assets are saved to in the S3 bucket.
   *  3. Changes the knowledge notebook vector database used.
   *  4. Handles payments on the platform (Only relevant for the cloud version)
   *  6. Logs emails instead of sending them.
   */
  ENVIRONMENT: process.env.ENVIRONMENT,

  /**
   * The port the server will run on.
   */
  PORT: process.env.PORT || 9094,

  /**
   * Secret key used for signing and verifying JWT tokens.
   * This key should be a long, random string for security.
   */
  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,

  /**
   * The secret key used for encrypting and decrypting callback state.
   */
  APP_OAUTH_CALLBACK_STATE_SECRET: process.env.APP_OAUTH_CALLBACK_STATE_SECRET,

  /**
   * Used for the CryptoService to encrypt and decrypt connection data.
   * Must be 32 characters long.
   */
  CRYPTO_ENCRYPTION_KEY: process.env.CRYPTO_ENCRYPTION_KEY,

  /**
   * The Database URL for the platform.
   */
  DATABASE_URL: process.env.DATABASE_URL,

  /**
   * The URL for the server.
   */
  SERVER_URL: process.env.SERVER_URL,

  /**
   * Commercial key use some premium features.
   * You must have a commercial license to change this value.
   */
  COMMERCIAL_KEY: process.env.COMMERCIAL_KEY,

  /**
   * The name of the platform. This is used for white labeling the platform.
   * You must have a commercial license to change this value.
   */
  PLATFORM_NAME: process.env.PLATFORM_NAME || 'Lecca.io',

  /**
   * Used for the ngrok tunnel URL. This is used for testing integrations locally that don't support localhost.
   * Espcially Webhook. For the best experience, you should use the ngrok tunnel URL instead of localhost.
   *
   * To run the tunnel configure your ngrok connection using the script they provide when creating an account
   * Then update the package.json start:tunnel script with your port and domain.
   * Then use the following command: `pnpm start:tunnel`
   */
  NGROK_TUNNEL_URL: process.env.NGROK_TUNNEL_URL,

  /**
   * The URL of the web app client
   */
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  /**
   * The email options for the nodemailer mail service configuration.
   */
  MAIL_OPTIONS: {
    /**
     * The email service used for sending emails.
     * Currently only `gmail` has been used and tested.
     */
    MAIL_SERVICE: process.env.MAIL_SERVICE,

    /**
     * The name of the sender of the email.
     */
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,

    /**
     * The email address of the sender of the email.
     */
    MAIL_FROM_EMAIL_ADDRESS: process.env.MAIL_FROM_EMAIL_ADDRESS,

    /**
     * The client ID for the email service.
     */
    MAIL_CLIENT_ID: process.env.MAIL_CLIENT_ID,

    /**
     * The client secret for the email service.
     */
    MAIL_CLIENT_SECRET: process.env.MAIL_CLIENT_SECRET,

    /**
     * The refresh token for the email service.
     * Used by nodemailer to refresh the token for you.
     */
    MAIL_REFRESH_TOKEN: process.env.MAIL_REFRESH_TOKEN,
  },

  /**
   * The Google Login Client ID for the platform.
   * Used for authenticating users with Google.
   */
  GOOGLE_LOGIN_CLIENT_ID: process.env.GOOGLE_LOGIN_CLIENT_ID,

  /**
   * Used for the S3 Service. The S3 Service is currently used for the following:
   *  1. Storing profile pictures of workspace users.
   *  2. Storing workspace logo images.
   *  3. Storing uploaded files used for vector embedding references.
   *  4. Storing temporary files when workflow actions require downloading them.
   */
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,

  /**
   * Used with the S3_ACCESS_KEY_ID for the S3 Service.
   * View the S3_ACCESS_KEY_ID for more information.
   */
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,

  /**
   * The S3 Region for the S3 Service.
   * View the S3_ACCESS_KEY_ID for more information.
   */
  S3_REGION: process.env.S3_REGION,

  /**
   * The S3 Bucket ID used for the S3 Service.
   * View the S3_ACCESS_KEY_ID for more information.
   */
  S3_BUCKET_ID: process.env.S3_BUCKET_ID,

  /**
   * If you are using ollama, you can override the base URL here.
   */
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434/api',

  /**
   * Used for running AI actions on the platform.
   */
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  /**
   * Used for running AI actions on the platform.
   */
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,

  /**
   * Used for running AI actions on the platform.
   */
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  /**
   * Used for embedding text into vectors using the OpenAI API.
   * This is used when uploading data to knowledge notebooks and querying them.
   *
   * This is a separate key from the OPENAI_API_KEY because it is used for a different purpose,
   * but it is still the same type of key.
   */
  OPENAI_EMBEDDING_API_KEY: process.env.OPENAI_EMBEDDING_API_KEY,

  /**
   * Used for the Pinecone API for storing and querying vectors.
   * This is used when uploading data to knowledge notebooks and querying them.
   */
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,

  /**
   * The name of the index used for storing vectors in Pinecone.
   * If you haven't created an index yet. Create a Pinecone Project and then create a new Index within the project.
   *
   * We currently only support an Index with a dimension of 1536.
   * So all embedding models must either have a dimension of 1536 or be able to convert to 1536.
   */
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,

  /**
   * Stripe keys are for handling payments on the platform.
   * Only relevant for the cloud version.
   */
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

  /**
   * Stripe keys are for handling payments on the platform.
   * Only relevant for the cloud version.
   */
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  /**
   * The Serper API key is used for searching the web.
   * This is currently used for the following:
   *  1. Enabling web access for AI Agents.
   *  2. Using google search as a step in the workflow builder.
   */
  SERPER_API_KEY: process.env.SERPER_API_KEY,

  /**
   * This key is used for extracting data from websites.
   * This is currently used for the following:
   *  1. Enabling web access for AI Agents.
   *  2. Extract content from websites in the workflow builder.
   */
  APIFY_API_KEY: process.env.APIFY_API_KEY,

  /**
   * This key is used for extracting dynamic content from websites.
   *
   * Create a task from the apify/website-content-crawler actor.
   * Modify the crawler settings to whatever limit of pages you want (I set mine to 1).
   * Use the task ID as this APIFY_EXTRACT_DYNAMIC_CONTENT_TASK_ID
   */
  APIFY_EXTRACT_DYNAMIC_CONTENT_TASK_ID:
    process.env.APIFY_EXTRACT_DYNAMIC_CONTENT_TASK_ID,

  /**
   * This key is used for extracting content from static websites.
   *
   * Create a task from the apify/cherio-scraper actor.
   * Modify the crawler settings to whatever limit of pages you want (I set mine to 1).
   * Use the task ID as this APIFY_EXTRACT_STATIC_CONTENT_TASK_ID
   */
  APIFY_EXTRACT_STATIC_CONTENT_TASK_ID:
    process.env.APIFY_EXTRACT_STATIC_CONTENT_TASK_ID,

  /**
   * This key is used for making phone calls using VAPI.
   * This is currently used for the following:
   *  1. Enabling phone calls for AI Agents.
   *  2. Making phone calls in the workflow builder.
   *
   * Note: You must import at least one phone number into VAPI before you can make calls.
   */
  VAPI_API_KEY: process.env.VAPI_API_KEY,

  /**
   * Used to retrieve environment variables from AWS Parameter Store.
   * Only used in the cloud version.
   */
  PARAM_STORE_ACCESS_KEY: process.env.PARAM_STORE_ACCESS_KEY,

  /**
   * Used to retrieve environment variables from AWS Parameter Store.
   * Only used in the cloud version.
   */
  PARAM_STORE_SECRET_ACCESS_KEY: process.env.PARAM_STORE_SECRET_ACCESS_KEY,

  /**
   * Used to retrieve environment variables from AWS Parameter Store.
   * Only used in the cloud version.
   */
  PARAM_STORE_REGION: process.env.PARAM_STORE_REGION,

  /**
   * The LLM provider used for AI Actions and AI Agents.
   * We currently support `openai`.
   *
   * Make sure you have the proper provider api key set.
   */
  DEFAULT_LLM_PROVIDER: process.env.DEFAULT_LLM_PROVIDER ?? 'openai',

  /**
   * The LLM model used for AI Actions and AI Agents
   *
   */
  DEFAULT_LLM_MODEL: process.env.DEFAULT_LLM_MODEL ?? 'gpt-4o',

  /**
   * The default embedding provider used for embedding text into vectors.
   * We currently support `openai`.
   *
   * Make sure you have the proper provider api key set.
   */
  DEFAULT_EMBEDDING_PROVIDER:
    process.env.DEFAULT_EMBEDDING_PROVIDER ?? 'openai',

  /**
   * The embedding model used with the embedding provider.
   *
   * Make sure the model supports the dimension of 1536.
   */
  DEFAULT_EMBEDDING_MODEL:
    process.env.DEFAULT_EMBEDDING_MODEL ?? 'text-embedding-3-small',

  NEW_USER_WORKFLOW_ID: process.env.NEW_USER_WORKFLOW_ID,

  /**
   * The base URL for the integration logo and icons.
   * This is mostly for the future if we start serving using a CDN or something
   * it will be quick to update.
   */
  INTEGRATION_ICON_BASE_URL:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets',

  /**
   * Integration keys are used for connecting to third-party services.
   *
   * All integration keys are optional. If you do not provide the keys, the integrations will not be visible in the UI.
   * Integrations that do not require keys will still be visible.
   *
   * Make sure the environment variable is prefixed with `INTEGRATION_`.
   * The key should match the name of the integration in uppercase (without the INTEGRATION_ part).
   * If they do not match the value will not be set.
   */
  INTEGRATIONS: {
    //Gmail
    GMAIL_CLIENT_ID: process.env.INTEGRATION_GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET: process.env.INTEGRATION_GMAIL_CLIENT_SECRET,

    //Google Sheets
    GOOGLE_SHEETS_CLIENT_ID: process.env.INTEGRATION_GOOGLE_SHEETS_CLIENT_ID,
    GOOGLE_SHEETS_CLIENT_SECRET:
      process.env.INTEGRATION_GOOGLE_SHEETS_CLIENT_SECRET,

    //Google Docs
    GOOGLE_DOCS_CLIENT_ID: process.env.INTEGRATION_GOOGLE_DOCS_CLIENT_ID,
    GOOGLE_DOCS_CLIENT_SECRET:
      process.env.INTEGRATION_GOOGLE_DOCS_CLIENT_SECRET,

    //Gooogle Calendar
    GOOGLE_CALENDAR_CLIENT_ID:
      process.env.INTEGRATION_GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET:
      process.env.INTEGRATION_GOOGLE_CALENDAR_CLIENT_SECRET,

    //Google Drive
    GOOGLE_DRIVE_CLIENT_ID: process.env.INTEGRATION_GOOGLE_DRIVE_CLIENT_ID,
    GOOGLE_DRIVE_CLIENT_SECRET:
      process.env.INTEGRATION_GOOGLE_DRIVE_CLIENT_SECRET,

    //Google Forms
    GOOGLE_FORMS_CLIENT_ID: process.env.INTEGRATION_GOOGLE_FORMS_CLIENT_ID,
    GOOGLE_FORMS_CLIENT_SECRET:
      process.env.INTEGRATION_GOOGLE_FORMS_CLIENT_SECRET,

    //Google Contacts
    GOOGLE_CONTACTS_CLIENT_ID:
      process.env.INTEGRATION_GOOGLE_CONTACTS_CLIENT_ID,
    GOOGLE_CONTACTS_CLIENT_SECRET:
      process.env.INTEGRATION_GOOGLE_CONTACTS_CLIENT_SECRET,

    //Google Slides
    GOOGLE_SLIDES_CLIENT_ID: process.env.INTEGRATION_GOOGLE_SLIDES_CLIENT_ID,
    GOOGLE_SLIDES_CLIENT_SECRET:
      process.env.INTEGRATION_GOOGLE_SLIDES_CLIENT_SECRET,

    //YouTube
    YOUTUBE_CLIENT_ID: process.env.INTEGRATION_YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET: process.env.INTEGRATION_YOUTUBE_CLIENT_SECRET,

    //Notion
    NOTION_CLIENT_ID: process.env.INTEGRATION_NOTION_CLIENT_ID,
    NOTION_CLIENT_SECRET: process.env.INTEGRATION_NOTION_CLIENT_SECRET,

    //Slack
    SLACK_CLIENT_ID: process.env.INTEGRATION_SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.INTEGRATION_SLACK_CLIENT_SECRET,
    SLACK_SIGNING_SECRET: process.env.INTEGRATION_SLACK_SIGNING_SECRET,

    //Close
    CLOSE_CLIENT_ID: process.env.INTEGRATION_CLOSE_CLIENT_ID,
    CLOSE_CLIENT_SECRET: process.env.INTEGRATION_CLOSE_CLIENT_SECRET,

    //Microsoft 365 Excel
    MICROSOFT_365_EXCEL_CLIENT_ID:
      process.env.INTEGRATION_MICROSOFT_365_EXCEL_CLIENT_ID,
    MICROSOFT_365_EXCEL_CLIENT_SECRET:
      process.env.INTEGRATION_MICROSOFT_365_EXCEL_CLIENT_SECRET,

    //Microsoft Outlook
    MICROSOFT_OUTLOOK_CLIENT_ID:
      process.env.INTEGRATION_MICROSOFT_OUTLOOK_CLIENT_ID,
    MICROSOFT_OUTLOOK_CLIENT_SECRET:
      process.env.INTEGRATION_MICROSOFT_OUTLOOK_CLIENT_SECRET,

    //LinkedIn
    LINKEDIN_CLIENT_ID: process.env.INTEGRATION_LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.INTEGRATION_LINKEDIN_CLIENT_SECRET,

    //X
    X_CLIENT_ID: process.env.INTEGRATION_X_CLIENT_ID,
    X_CLIENT_SECRET: process.env.INTEGRATION_X_CLIENT_SECRET,

    //Hubspot
    HUBSPOT_APP_ID: process.env.INTEGRATION_HUBSPOT_APP_ID,
    HUBSPOT_CLIENT_ID: process.env.INTEGRATION_HUBSPOT_CLIENT_ID,
    HUBSPOT_CLIENT_SECRET: process.env.INTEGRATION_HUBSPOT_CLIENT_SECRET,

    //Zoho CRM
    ZOHO_CRM_CLIENT_ID: process.env.INTEGRATION_ZOHO_CRM_CLIENT_ID,
    ZOHO_CRM_CLIENT_SECRET: process.env.INTEGRATION_ZOHO_CRM_CLIENT_SECRET,

    //Zoho Books
    ZOHO_BOOKS_CLIENT_ID: process.env.INTEGRATION_ZOHO_BOOKS_CLIENT_ID,
    ZOHO_BOOKS_CLIENT_SECRET: process.env.INTEGRATION_ZOHO_BOOKS_CLIENT_SECRET,

    //Calendly
    CALENDLY_CLIENT_ID: process.env.INTEGRATION_CALENDLY_CLIENT_ID,
    CALENDLY_CLIENT_SECRET: process.env.INTEGRATION_CALENDLY_CLIENT_SECRET,
    CALENDLY_SIGNING_SECRET: process.env.INTEGRATION_CALENDLY_SIGNING_SECRET,

    //Dropbox
    DROPBOX_CLIENT_ID: process.env.INTEGRATION_DROPBOX_CLIENT_ID,
    DROPBOX_CLIENT_SECRET: process.env.INTEGRATION_DROPBOX_CLIENT_SECRET,

    //Facebook Pages
    FACEBOOK_PAGES_CLIENT_ID: process.env.INTEGRATION_FACEBOOK_PAGES_CLIENT_ID,
    FACEBOOK_PAGES_CLIENT_SECRET:
      process.env.INTEGRATION_FACEBOOK_PAGES_CLIENT_SECRET,

    //Instagram Business
    INSTAGRAM_BUSINESS_CLIENT_ID:
      process.env.INTEGRATION_INSTAGRAM_BUSINESS_CLIENT_ID,
    INSTAGRAM_BUSINESS_CLIENT_SECRET:
      process.env.INTEGRATION_INSTAGRAM_BUSINESS_CLIENT_SECRET,
  },
};
