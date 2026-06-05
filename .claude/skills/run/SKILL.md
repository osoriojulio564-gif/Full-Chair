description: Launch the Next.js dev server and drive it with Playwright screenshots
triggers:
  - run
  - start
  - preview
  - screenshot

## Prerequisites

- Node.js 18+
- Chromium browser at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (or system default)

## Setup (first time only)

```bash
npm install
npx prisma db push
npm run db:seed
```

## Start the dev server

```bash
# Kill any existing instance
fuser -k 3000/tcp 2>/dev/null; sleep 1

# Start in background
npx next dev -p 3000 > /tmp/next-dev.log 2>&1 &

# Wait until ready
for i in $(seq 1 15); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 2
done
```

## Take screenshots

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-gpu']
  });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/run-landing.png', fullPage: true });
  console.log('Landing done');

  await browser.close();
})();
"
```

Then read `/tmp/run-landing.png` to verify.

## Demo credentials

- Email: `maria@glamourstudio.com`
- Password: `password123`

## Key routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/explore` | Salon marketplace |
| `/login` | Sign in |
| `/dashboard` | Dashboard (after login) |
| `/appointments` | Appointment management |
| `/clients` | Client CRM |
| `/services` | Service menu |
| `/staff` | Staff management |
| `/reviews` | Ratings & reviews |
| `/notifications` | Real-time alerts |
| `/whatsapp` | WhatsApp config |
| `/settings` | Salon settings |
| `/salon/glamour-studio` | Premium branded page |
| `/book/glamour-studio` | Public booking flow |

## Full screenshot script

Use `node screenshot-full.mjs` to capture all 20 pages (desktop + mobile) to `/tmp/ui-*.png`.
