import { createApp } from '@lecca-io/toolkit';

import { apify } from './lib/apify/apify.app';
import { calendly } from './lib/calendly/calendly.app';
import { csv } from './lib/csv/csv.app';
import { date } from './lib/date/date.app';
import { dropbox } from './lib/dropbox/dropbox.app';
import { flowControl } from './lib/flow-control/flow-control.app';
import { gmail } from './lib/gmail/gmail.app';
import { googleCalendar } from './lib/google-calendar/google-calendar.app';
import { googleContacts } from './lib/google-contacts/google-contacts.app';
import { googleDocs } from './lib/google-docs/google-docs.app';
import { googleDrive } from './lib/google-drive/google-drive.app';
import { googleForms } from './lib/google-forms/google-forms.app';
import { googleSheets } from './lib/google-sheets/google-sheets.app';
import { googleSlides } from './lib/google-slides/google-slides.app';
import { hubspot } from './lib/hubspot/hubspot.app';
import { json } from './lib/json/json.app';
import { linkedin } from './lib/linkedin/linkedin.app';
import { list } from './lib/list/list.app';
import { math } from './lib/math/math.app';
import { microsoftExcel365 } from './lib/microsoft-excel-365/microsoft-excel-365.app';
import { microsoftOutlook } from './lib/microsoft-outlook/microsoft-outlook.app';
import { notion } from './lib/notion/notion.app';
import { paradigmVendo } from './lib/paradigm-vendo/paradigm-vendo.app';
import { salesRabbit } from './lib/sales-rabbit/sales-rabbit.app';
import { slack } from './lib/slack/slack.app';
import { text } from './lib/text/text.app';
import { vapi } from './lib/vapi/vapi.app';
import { x } from './lib/x/x.app';
import { youtube } from './lib/youtube/youtube.app';
import { zohoBooks } from './lib/zoho-books/zoho-books.app';
import { zohoCrm } from './lib/zoho-crm/zoho-crm.app';

const apps: Record<string, ReturnType<typeof createApp>> = {
  [apify.id]: apify,
  [calendly.id]: calendly,
  [csv.id]: csv,
  [date.id]: date,
  [dropbox.id]: dropbox,
  [flowControl.id]: flowControl,
  [gmail.id]: gmail,
  [googleCalendar.id]: googleCalendar,
  [googleContacts.id]: googleContacts,
  [googleDocs.id]: googleDocs,
  [googleDrive.id]: googleDrive,
  [googleForms.id]: googleForms,
  [googleSheets.id]: googleSheets,
  [googleSlides.id]: googleSlides,
  [hubspot.id]: hubspot,
  [json.id]: json,
  [linkedin.id]: linkedin,
  [list.id]: list,
  [math.id]: math,
  [microsoftExcel365.id]: microsoftExcel365,
  [microsoftOutlook.id]: microsoftOutlook,
  [notion.id]: notion,
  [paradigmVendo.id]: paradigmVendo,
  [salesRabbit.id]: salesRabbit,
  [slack.id]: slack,
  [text.id]: text,
  [vapi.id]: vapi,
  [x.id]: x,
  [youtube.id]: youtube,
  [zohoBooks.id]: zohoBooks,
  [zohoCrm.id]: zohoCrm,
};

export {
  apify,
  calendly,
  csv,
  date,
  dropbox,
  flowControl,
  gmail,
  googleCalendar,
  googleContacts,
  googleDocs,
  googleDrive,
  googleForms,
  googleSheets,
  googleSlides,
  hubspot,
  linkedin,
  list,
  math,
  microsoftExcel365,
  microsoftOutlook,
  notion,
  paradigmVendo,
  salesRabbit,
  slack,
  text,
  vapi,
  x,
  youtube,
  zohoBooks,
  zohoCrm,
};

export default apps;
