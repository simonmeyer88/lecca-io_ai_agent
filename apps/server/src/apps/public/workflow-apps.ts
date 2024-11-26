import { WorkflowAppConstructor } from '../lib/workflow-app';

import { AI } from './ai/ai.app';
import { Anthropic } from './anthropic/anthropic.app';
import { Apify } from './apify/apify.app';
import { Calendly } from './calendly/calendly.app';
import { Close } from './close/close.app';
import { CSV } from './csv/csv.app';
import { DateHelper } from './date/date.app';
import { Dropbox } from './dropbox/dropbox.app';
import { FacebookPages } from './facebook-pages/facebook-pages.app';
import { FlowControl } from './flow-control/flow-control.app';
import { Gemini } from './gemini/gemini.app';
import { Gmail } from './gmail/gmail.app';
import { GoogleCalendar } from './google-calendar/google-calendar.app';
import { GoogleContacts } from './google-contacts/google-contacts.app';
import { GoogleDocs } from './google-docs/google-docs.app';
import { GoogleDrive } from './google-drive/google-drive.app';
import { GoogleForms } from './google-forms/google-forms.app';
import { GoogleSheets } from './google-sheets/google-sheets.app';
import { GoogleSlides } from './google-slides/google-slides.app';
import { Hubspot } from './hubspot/hubspot.app';
import { InstagramBusiness } from './instagram-business/instagram-business.app';
import { JSON } from './json/json.app';
import { Knowledge } from './knowledge/knowledge.app';
import { Linkedin } from './linkedin/linkedin.app';
import { List } from './list/list.app';
import { Math } from './math/math.app';
import { MicrosoftExcel365 } from './microsoft-excel-365/microsoft-excel-365.app';
import { MicrosoftOutlook } from './microsoft-outlook/microsoft-outlook.app';
import { Notion } from './notion/notion.app';
import { OpenAI } from './openai/openai.app';
import { ParadigmVendo } from './paradigm-vendo/paradigm-vendo.app';
import { Phone } from './phone/phone.app';
import { SalesRabbit } from './sales-rabbit/sales-rabbit.app';
import { Slack } from './slack/slack.app';
import { Text } from './text/text.app';
import { Vapi } from './vapi/vapi.app';
import { Variables } from './variables/variables.app';
import { Web } from './web/web.app';
import { X } from './x/x.app';
import { XML } from './xml/xml.app';
import { YouTube } from './youtube/youtube.app';
import { ZohoBooks } from './zoho-books/zoho-books.app';
import { ZohoCrm } from './zoho-crm/zoho-crm.app';

/**
 * Add new workflow apps here.
 */
const WORKFLOW_APPS_NO_TYPES = {
  ai: AI,
  anthropic: Anthropic,
  apify: Apify,
  calendly: Calendly,
  close: Close,
  csv: CSV,
  date: DateHelper,
  dropbox: Dropbox,
  'facebook-pages': FacebookPages,
  'flow-control': FlowControl,
  gemini: Gemini,
  gmail: Gmail,
  'google-calendar': GoogleCalendar,
  'google-contacts': GoogleContacts,
  'google-docs': GoogleDocs,
  'google-drive': GoogleDrive,
  'google-forms': GoogleForms,
  'google-sheets': GoogleSheets,
  'google-slides': GoogleSlides,
  hubspot: Hubspot,
  'instagram-business': InstagramBusiness,
  json: JSON,
  knowledge: Knowledge,
  linkedin: Linkedin,
  list: List,
  math: Math,
  'microsoft-excel-365': MicrosoftExcel365,
  'microsoft-outlook': MicrosoftOutlook,
  notion: Notion,
  openai: OpenAI,
  'paradigm-vendo': ParadigmVendo,
  phone: Phone,
  'sales-rabbit': SalesRabbit,
  slack: Slack,
  text: Text,
  vapi: Vapi,
  variables: Variables,
  web: Web,
  x: X,
  xml: XML,
  youtube: YouTube,
  'zoho-books': ZohoBooks,
  'zoho-crm': ZohoCrm,
} as const;

export type WorkflowAppsKey = keyof typeof WORKFLOW_APPS_NO_TYPES;

export const WORKFLOW_APPS: Record<WorkflowAppsKey, WorkflowAppConstructor> =
  WORKFLOW_APPS_NO_TYPES;
