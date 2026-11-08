/**
 * Captures the screens the client asked to see, by driving a real browser
 * against a running dev server — no manual clicking.
 *
 *   npm run dev            # in another terminal
 *   npx tsx scripts/capture-screenshots.ts
 *
 * Output lands in ./screenshots (untracked).
 *
 * Auth note: the app keeps its access token in localStorage and the role in a
 * cookie, so each persona signs in through /api/login and both are injected
 * before the first navigation. Three of the screens are deliberately
 * theatrical — the Hall of Fame opens a pair of gates on click, and each Book
 * of Records opens a cover — so those are clicked and waited out rather than
 * shot closed.
 */
import { chromium, type Browser, type Page } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'screenshots');

type Persona = { label: string; email: string; password: string };

const ADMIN: Persona = { label: 'admin', email: 'demo.admin@pes.test', password: 'Demo1234!' };
const STAFF: Persona = { label: 'staff', email: 'demo.awarded@pes.test', password: 'Demo1234!' };
const AUDITOR: Persona = { label: 'auditor', email: 'demo.auditor@pes.test', password: 'AuditorDemo1234!' };

/** Sign in through the real login form.
 *
 *  The access token is held in memory by TokenManager, not in localStorage, so
 *  injecting storage does nothing — the app would start tokenless and every
 *  hook that reads the session would come up empty. Driving the form is also
 *  the honest thing to capture: it is the state a real user is in. */
async function signIn(browser: Browser, who: Persona) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', who.email);
  await page.fill('input[name="password"]', who.password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState('networkidle').catch(() => {});

  return { ctx, page };
}

async function shot(page: Page, file: string, label: string) {
  await page.screenshot({ path: path.join(OUT, file), fullPage: false });
  console.log(`  ✓ ${file.padEnd(34)} ${label}`);
}

/** Give the page a moment to finish its data fetch and any transition. */
async function settle(page: Page, ms = 1800) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ---- staff: their own certificate, badge and awards -------------------
  {
    const { ctx, page } = await signIn(browser, STAFF);
    const name = encodeURIComponent('Demo Awarded Lecturer');

    await page.goto(`${BASE}/reward/certificates/1st/${name}`);
    await settle(page);
    await shot(page, '01-certificate-1st-class.png', 'Certificate, 1st class');

    await page.goto(`${BASE}/reward/badges/${name}`);
    await settle(page);
    await shot(page, '02-badge-1st-class.png', 'Badge, 1st class');

    await page.goto(`${BASE}/my-awards`);
    await settle(page);
    await shot(page, '03-my-awards.png', 'My Awards (staff view)');

    await ctx.close();
  }

  // ---- admin: recognition, the books, the hall of fame ------------------
  {
    const { ctx, page } = await signIn(browser, ADMIN);

    await page.goto(`${BASE}/recognition`);
    await settle(page);
    await shot(page, '04-recognition-hub.png', 'Recognition hub');

    // The gates open on click and the scroll scales in over ~2s.
    await page.goto(`${BASE}/hall-of-fame`);
    await settle(page);
    await page.locator('img[alt="gate left"]').click().catch(() => {});
    await page.waitForTimeout(2600);
    await shot(page, '05-hall-of-fame.png', 'Hall of Fame (gates opened)');

    for (const [url, file, label] of [
      [`${BASE}/book-of-record/performance`, '06-book-of-records-1st.png', '1st Book of Records'],
      [`${BASE}/book-of-record/second/performance`, '07-book-of-records-2nd.png', '2nd Book of Records'],
    ] as const) {
      await page.goto(url);
      await settle(page);
      // Each book opens by clicking its cover.
      await page.locator('img[alt="Book Cover"]').click().catch(() => {});
      await page.waitForTimeout(1200);
      await shot(page, file, label);
    }

    // The org admin's vetting queue, with the row expanded to show documents.
    await page.goto(`${BASE}/admin/auditors`);
    await settle(page);
    await page.locator('tbody tr').first().click().catch(() => {});
    await page.waitForTimeout(700);
    await shot(page, '08-auditor-vetting-documents.png', 'External auditor documents (org admin)');

    await ctx.close();
  }

  // ---- auditor: their own consent control -------------------------------
  {
    const { ctx, page } = await signIn(browser, AUDITOR);
    await page.goto(`${BASE}/profile`);
    await settle(page);
    await shot(page, '09-auditor-consent.png', 'Recognition by PES (auditor profile)');
    await ctx.close();
  }

  await browser.close();
  console.log(`\nSaved to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
