const { chromium } = require('playwright');
const fs = require('fs');
const ROUTES = ['/', '/find-cover', '/friends', '/pet', '/me', '/prototype', '/notifications', '/task/t-lunch', '/missed/t-walk', '/day-report', '/emergency',
  '/rewards', '/health', '/pilot', '/coverage', '/add-pet', '/helper-invite', '/helper-history', '/code-card', '/pet-edit', '/routine', '/care-circle', '/return-check',
  '/helper', '/basic-phone', '/friend-request', '/friend/f-priya', '/friend-settings', '/privacy-profile', '/look-in?task=t-walk', '/styleguide',
  '/later/daycares', '/later/daycare?id=dc-paws', '/later/certificate', '/later/dropoff', '/later/stay', '/later/dc-today', '/later/dc-handover', '/later/dc-showme',
  '/later/dc-audit', '/later/carers', '/later/carer', '/later/carer-visit', '/icons'];
(async () => {
  const body = fs.readFileSync(process.argv[2], 'utf8');
  const out = process.argv[3];
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body style="margin:0">${body}</body></html>`;
  const b = await chromium.launch();
  let problems = 0;
  for (const width of [390, 768, 1280]) {
    const p = await b.newPage({ viewport: { width, height: 900 } });
    const PAGE = 'https://artifact.test/r/page';
    await p.route('**/*', (r) => (r.request().url() === PAGE ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort()));
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('pawsure.prototype.signedIn', '1'); localStorage.setItem('pawsure.prototype.onboarded', '1'); });
    await p.goto(PAGE);
    await p.getByText('Neha!').first().waitFor({ timeout: 20000 });
    for (const r of ROUTES) {
      await p.evaluate((path) => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); }, r);
      await p.waitForTimeout(350);
      const res = await p.evaluate(() => {
        const vw = innerWidth;
        const over = [];
        for (const el of document.querySelectorAll('#root *')) {
          const rc = el.getBoundingClientRect();
          if (rc.width === 0 || rc.height === 0 || rc.left >= vw || rc.right <= 0) continue; // off-screen stacked screens
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          if (rc.right > vw + 1) over.push(`${el.tagName}:${(el.innerText || '').slice(0, 30)}:${Math.round(rc.right)}`);
        }
        const text = document.body.innerText;
        // The body never scrolls, so content taller than the window must sit inside a scroll view.
        const clipped = document.documentElement.scrollHeight > innerHeight + 1 ? document.documentElement.scrollHeight : 0;
        return { over: over.slice(0, 3), clipped, unmatched: /Unmatched Route|doesn't exist/.test(text), len: text.length };
      });
      if (res.over.length || res.clipped || res.unmatched || res.len < 80) { problems++; console.log(`[${width}] ${r}`, JSON.stringify(res)); }
      if (width !== 390 && ['/', '/find-cover', '/rewards'].includes(r)) await p.screenshot({ path: `${out}/w${width}${r.replace(/\W/g, '_')}.png` });
    }
    if (errs.length) { problems++; console.log(`[${width}] page errors:`, errs.join(' | ')); }
    await p.close();
  }
  console.log(problems ? `${problems} problems` : `ALL ${ROUTES.length} ROUTES OK at 390/768/1280, no overflow, every screen scrolls, no errors`);
  await b.close();
})();
