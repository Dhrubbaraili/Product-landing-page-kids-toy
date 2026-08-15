# kids Toy — Interactive RC Dancing Robot

Production-ready Next.js + Tailwind COD sales funnel for the Interactive RC Dancing Robot.

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The public flow is `/` → `/checkout` → `/thank-you`; orders are submitted to `POST /api/order`.

## Configure Google Sheets

1. Create a Google Spreadsheet and rename the working tab to `sheet 1` (or set `GOOGLE_SHEET_TAB_NAME` to the exact tab name).
2. Add this header row in row 1:

   `Order ID | Date & Time | Customer Name | Phone Number | Email Address | Exact Location | Product Name | Quantity | Price Per Piece | Total Price | Payment Method | Order Status | Notes`

3. Add a filter to row 1 using **Data → Create a filter**.
4. Add a dropdown to the Order Status column using **Data → Data validation** with: `New Order`, `Order Confirmed`, `Order Ongoing`, `Delivered`, `Cancelled`.
5. Copy the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/THIS_VALUE/edit`.
6. Create a Google Cloud service account, enable the Google Sheets API, and create/download its JSON key.
7. Copy the service account `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL` and the private key into `GOOGLE_PRIVATE_KEY`. In Vercel, preserve line breaks as `\\n`; the API converts them safely at runtime.
8. Share the spreadsheet with the service account email as Editor. The sheet must be shared or the append will fail.

## Configure email

The API uses Nodemailer SMTP. For Gmail, use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER` as the sending account, and an App Password in `SMTP_PASS` (not the normal Gmail password). Set `EMAIL_FROM` to the visible sender, `BUSINESS_EMAIL` to the business inbox, and `BRAND_NAME=kids Toy`.

The API first appends the order to Sheets, then sends the business notification and customer confirmation. It returns success only after all three actions complete. Configuration or provider errors are returned to the checkout and are logged server-side; no secret is sent to the browser.

## Environment variables

See `.env.example`. Required for live submission: `BUSINESS_EMAIL`, `EMAIL_FROM`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB_NAME`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`. `EMAIL_SERVICE_API_KEY` is reserved for a future provider and is not required for SMTP.

## Test a real order

1. Add all environment variables locally or in Vercel.
2. Run `npm run dev` or `npm run start` after `npm run build`.
3. Place an order using a real customer email you can check.
4. Confirm a new row appears in the configured tab, the business inbox receives `New Product Order Received - [Order ID]`, the customer receives `Your Order Has Been Received - kids Toy`, and the browser lands on `/thank-you`.

Without credentials, the API intentionally returns a clear “server is not configured yet” error instead of pretending an order succeeded.

## Deploy to Vercel

1. Push this folder to GitHub or import the project directly into Vercel.
2. Set the environment variables in Vercel Project Settings → Environment Variables for Preview/Production as needed.
3. Deploy. No separate backend or CORS configuration is required because `/api/order` is a Next.js server route. If a separate frontend domain is later used, set `FRONTEND_URL` and keep API requests same-origin where possible.

## Editing product content

Product name, pricing, benefits, specifications, images, testimonials, and FAQs are centralized in `lib/product.ts`. Replace the PNGs in `public/images/` if you want alternate product photos. Product reels were not provided, so the reels section is intentionally omitted.

## Language and date display

The shared language switcher supports English and Nepali across the landing page, checkout, FAQ, validation states, and thank-you page. The selection is saved in browser `localStorage` under `kids-toy-language`. The shared date widget converts the current Nepal-time date to Bikram Sambat, displays Nepali numerals in Nepali mode, updates every minute, and includes an optional AD-date toggle.
