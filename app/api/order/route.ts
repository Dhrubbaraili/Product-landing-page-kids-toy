import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import { createPrivateKey } from 'node:crypto';
import { product } from '@/lib/product';

const HEADERS = ['Order ID', 'Date & Time', 'Customer Name', 'Phone Number', 'Email Address', 'Exact Location', 'Product Name', 'Quantity', 'Price Per Piece', 'Total Price', 'Payment Method', 'Order Status', 'Notes'];
const required = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const orderId = () => `KT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));
const sheetRange = (tab: string, range: string) => `'${tab.replaceAll("'", "''")}'!${range}`;
type ServiceAccountCredentials = { client_email?: string; private_key?: string };

function validateServiceAccountCredentials(credentials: ServiceAccountCredentials) {
  const clientEmail = credentials.client_email?.trim();
  const privateKey = credentials.private_key?.replace(/\\n/g, '\n').trim();
  if (!clientEmail || !privateKey) throw new Error('Google service-account JSON is missing required fields.');
  try { createPrivateKey(privateKey); } catch { throw new Error('Google service-account private key is invalid.'); }
  return { client_email: clientEmail, private_key: privateKey };
}

function emailLayout(title: string, body: string) { return `<div style="background:#eef8ff;padding:28px 12px;font-family:Arial,sans-serif;color:#12233f"><table style="max-width:620px;width:100%;margin:auto;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="background:#12233f;padding:24px 28px;color:#fff;font-size:22px;font-weight:800">kids <span style="color:#21c4c7">Toy</span></td></tr><tr><td style="padding:30px"><h1 style="margin:0 0 12px;font-size:26px">${title}</h1>${body}</td></tr></table></div>`; }
const row = (label: string, value: unknown) => `<tr><td style="padding:9px 0;color:#6b7890">${escapeHtml(label)}</td><td style="padding:9px 0;text-align:right;font-weight:700">${escapeHtml(value)}</td></tr>`;

function getServiceAccountCredentials() {
  const encodedCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  if (encodedCredentials) {
    try {
      const normalizedBase64 = encodedCredentials.replace(/^data:application\/json;base64,/, '').replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
      const parsed = JSON.parse(Buffer.from(normalizedBase64, 'base64').toString('utf8')) as ServiceAccountCredentials;
      return validateServiceAccountCredentials(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('Google service-account JSON is invalid.');
      throw error;
    }
  }
  const configuredPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
  if (configuredPath) {
    const credentialPath = path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);
    try {
      const parsed = JSON.parse(fs.readFileSync(credentialPath, 'utf8')) as ServiceAccountCredentials;
      return validateServiceAccountCredentials(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('Google service-account JSON is invalid.');
      throw error;
    }
  }
  return validateServiceAccountCredentials({ client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY });
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({ credentials: getServiceAccountCredentials(), scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  await auth.getAccessToken();
  return google.sheets({ version: 'v4', auth });
}

async function ensurePremiumSheetLayout(sheets: ReturnType<typeof google.sheets>) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  const configuredTab = process.env.GOOGLE_SHEET_TAB_NAME!.trim();
  const workbook = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets(properties(sheetId,title),basicFilter)' });
  const sheet = workbook.data.sheets?.find(item => item.properties?.title?.trim().toLocaleLowerCase() === configuredTab.toLocaleLowerCase())
    || (workbook.data.sheets?.length === 1 ? workbook.data.sheets[0] : undefined);
  const tab = sheet?.properties?.title?.trim();
  if (sheet?.properties?.sheetId == null || !tab) {
    const availableTabs = (workbook.data.sheets || []).map(item => item.properties?.title?.trim()).filter(Boolean).join(', ') || 'none';
    throw new Error(`Google Sheet tab "${configuredTab}" was not found. Available tabs: ${availableTabs}. Check GOOGLE_SHEET_TAB_NAME.`);
  }
  const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range: sheetRange(tab, 'A1:M1') });
  if ((existing.data.values?.[0] || []).join('|') !== HEADERS.join('|')) await sheets.spreadsheets.values.update({ spreadsheetId, range: sheetRange(tab, 'A1:M1'), valueInputOption: 'RAW', requestBody: { values: [HEADERS] } });
  const sheetId = sheet.properties.sheetId;
  const requests: object[] = [
    { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 }, tabColor: { red: 0.22, green: 0.74, blue: 0.96 } }, fields: 'gridProperties.frozenRowCount,tabColor' } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 13 }, cell: { userEnteredFormat: { backgroundColor: { red: 0.07, green: 0.14, blue: 0.25 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 13 }, cell: { userEnteredFormat: { verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP' } }, fields: 'userEnteredFormat(verticalAlignment,wrapStrategy)' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 13 }, properties: { pixelSize: 140 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, properties: { pixelSize: 240 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 }, properties: { pixelSize: 220 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 12, endIndex: 13 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } }
  ];
  if (!sheet.basicFilter) requests.push({ setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: 13 } } } });
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  return tab;
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }
  const { name, phone, email, location, productName, quantity, pricePerPiece, totalPrice } = data;
  const quantityNumber = Number(quantity); const priceNumber = Number(pricePerPiece); const totalNumber = Number(totalPrice);
  if (![name, phone, email, location, productName].every(required) || !/^\S+@\S+\.\S+$/.test(String(email)) || productName !== product.name || priceNumber !== product.offerPrice || !Number.isInteger(quantityNumber) || quantityNumber < 1 || !Number.isFinite(totalNumber) || totalNumber !== priceNumber * quantityNumber) return NextResponse.json({ error: 'Please complete all fields with valid order details.' }, { status: 400 });
  const missing = ['GOOGLE_SHEET_ID', 'GOOGLE_SHEET_TAB_NAME', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM', 'BUSINESS_EMAIL'].filter(key => !process.env[key]);
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 && !process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH && (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY)) missing.push('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 (or GOOGLE_SERVICE_ACCOUNT_JSON_PATH or GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY)');
  if (missing.length) return NextResponse.json({ stage: 'CONFIGURATION', error: `[CONFIGURATION] Server is not configured yet. Missing: ${missing.join(', ')}` }, { status: 500 });
  const id = orderId(); const date = new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }); const status = 'New Order'; const payment = 'Cash On Delivery';
  let stage = 'GOOGLE_AUTH';
  try {
    const sheets = await getSheetsClient();
    stage = 'SPREADSHEET_ACCESS';
    let tab: string;
    try { tab = await ensurePremiumSheetLayout(sheets); } catch (error) { if (error instanceof Error && error.message.includes('Google Sheet tab')) stage = 'TAB_NOT_FOUND'; throw error; }
    stage = 'SHEET_WRITE';
    await sheets.spreadsheets.values.append({ spreadsheetId: process.env.GOOGLE_SHEET_ID!, range: sheetRange(tab, 'A:M'), valueInputOption: 'USER_ENTERED', requestBody: { values: [[id, date, name, phone, email, location, productName, quantityNumber, priceNumber, totalNumber, payment, status, '']] } });
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    stage = 'SMTP_LOGIN';
    await transporter.verify();
    const details = `<table style="width:100%;border-collapse:collapse">${row('Order ID', id)}${row('Date & Time', date)}${row('Customer', name)}${row('Phone', phone)}${row('Email', email)}${row('Location', location)}${row('Product', productName)}${row('Quantity', quantityNumber)}${row('Total price', `NPR ${totalNumber.toLocaleString('en-IN')}`)}${row('Payment', payment)}${row('Status', status)}</table>`;
    stage = 'BUSINESS_EMAIL';
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to: process.env.BUSINESS_EMAIL, replyTo: String(email), subject: `New Product Order Received - ${id}`, html: emailLayout('New order received', details + '<p style="margin-top:22px;background:#fff5d8;padding:15px;border-radius:10px;font-weight:700">Please call the customer soon to confirm this order.</p>') });
    stage = 'CUSTOMER_EMAIL';
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to: String(email), replyTo: process.env.EMAIL_FROM, subject: 'Your Order Has Been Received - kids Toy', html: emailLayout(`Thank you, ${escapeHtml(name)}!`, `<p>We have received your order successfully.</p>${details}<p style="margin-top:22px">Our sales representative will call you soon to confirm your order.</p><p>Thank you,<br><b>kids Toy</b><br><span style="color:#6b7890">${escapeHtml(process.env.EMAIL_FROM)}</span></p>`) });
    return NextResponse.json({ success: true, orderId: id });
  } catch (error) { const message = error instanceof Error ? error.message : 'Order submission failed. Please try again.'; const safeMessage = stage === 'GOOGLE_AUTH' ? 'Google service-account credentials were rejected.' : stage === 'SMTP_LOGIN' ? 'SMTP credentials were rejected by the mail provider.' : stage === 'BUSINESS_EMAIL' ? 'The business notification email could not be sent.' : stage === 'CUSTOMER_EMAIL' ? 'The customer confirmation email could not be sent.' : message.includes('Google Sheet tab') ? 'The configured Google Sheet tab was not found.' : stage === 'SHEET_WRITE' ? 'The order could not be written to Google Sheets.' : 'The order submission failed.'; return NextResponse.json({ stage, error: `[${stage}] ${safeMessage}` }, { status: 500 }); }
}
