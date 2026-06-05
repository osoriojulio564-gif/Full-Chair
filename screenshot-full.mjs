import { chromium } from 'playwright';
const BASE = 'http://localhost:3000';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });

  // Desktop screenshots
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  // 1. Landing
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/ui-01-landing.png', fullPage: true });
  console.log('1. Landing');

  // 2. Explore marketplace
  await page.goto(`${BASE}/explore`);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/tmp/ui-02-explore.png', fullPage: true });
  console.log('2. Explore');

  // 3. Login → Dashboard
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(500);
  await page.fill('input[type="email"]', 'maria@glamourstudio.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/tmp/ui-03-dashboard.png', fullPage: true });
  console.log('3. Dashboard');

  // 4. Appointments
  await page.goto(`${BASE}/appointments`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-04-appointments.png', fullPage: true });
  console.log('4. Appointments');

  // 5. New appointment form
  const newBtn = page.locator('button:has-text("New Appointment")');
  if (await newBtn.count() > 0) {
    await newBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/ui-05-new-appt.png', fullPage: true });
    console.log('5. New Appointment');
  }

  // 6. Clients
  await page.goto(`${BASE}/clients`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-06-clients.png', fullPage: true });
  console.log('6. Clients');

  // 7. Client detail
  const clientLink = page.locator('a[href^="/clients/"]').first();
  if (await clientLink.count() > 0) {
    await clientLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/ui-07-client-detail.png', fullPage: true });
    console.log('7. Client Detail');
  }

  // 8. Staff
  await page.goto(`${BASE}/staff`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-08-staff.png', fullPage: true });
  console.log('8. Staff');

  // 9. Staff detail
  const staffLink = page.locator('a[href^="/staff/"]').first();
  if (await staffLink.count() > 0) {
    await staffLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/ui-09-staff-detail.png', fullPage: true });
    console.log('9. Staff Detail');
  }

  // 10. Services
  await page.goto(`${BASE}/services`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-10-services.png', fullPage: true });
  console.log('10. Services');

  // 11. Reviews
  await page.goto(`${BASE}/reviews`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-11-reviews.png', fullPage: true });
  console.log('11. Reviews');

  // 12. Notifications
  await page.goto(`${BASE}/notifications`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-12-notifications.png', fullPage: true });
  console.log('12. Notifications');

  // 13. WhatsApp
  await page.goto(`${BASE}/whatsapp`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-13-whatsapp.png', fullPage: true });
  console.log('13. WhatsApp');

  // 14. Settings
  await page.goto(`${BASE}/settings`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-14-settings.png', fullPage: true });
  console.log('14. Settings');

  // 15. Premium branded salon page
  await page.goto(`${BASE}/salon/glamour-studio`);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/tmp/ui-15-branded.png', fullPage: true });
  console.log('15. Branded Salon');

  // 16. Public booking
  await page.goto(`${BASE}/book/glamour-studio`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/ui-16-booking.png', fullPage: true });
  console.log('16. Booking');

  // 17. Public review
  await page.goto(`${BASE}/review/test-id`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/ui-17-review.png', fullPage: true });
  console.log('17. Review');

  // Mobile screenshots
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mpage = await mobile.newPage();

  await mpage.goto(BASE);
  await mpage.waitForTimeout(1500);
  await mpage.screenshot({ path: '/tmp/ui-18-mobile-landing.png', fullPage: true });
  console.log('18. Mobile Landing');

  await mpage.goto(`${BASE}/explore`);
  await mpage.waitForTimeout(2500);
  await mpage.screenshot({ path: '/tmp/ui-19-mobile-explore.png', fullPage: true });
  console.log('19. Mobile Explore');

  await mpage.goto(`${BASE}/book/glamour-studio`);
  await mpage.waitForTimeout(2000);
  await mpage.screenshot({ path: '/tmp/ui-20-mobile-booking.png', fullPage: true });
  console.log('20. Mobile Booking');

  await browser.close();
  console.log('\nAll done!');
}
main().catch(e => { console.error(e); process.exit(1); });
