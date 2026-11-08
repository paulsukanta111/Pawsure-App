// Helper experience: switch views with the prototype dropdown, check in from Sunita's phone,
// see it on Neha's Today, open the Pawsure card, and stop.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [file, out] = process.argv.slice(2);
  const body = fs.readFileSync(file, 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">${body}</body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: html }));
  await p.addInitScript(() => { localStorage.setItem('pawsure.prototype.signedIn', '1'); localStorage.setItem('pawsure.prototype.onboarded', '1'); });
  await p.goto('https://artifact.test/s');
  const see = (t) => p.getByText(t).filter({ visible: true }).first().waitFor({ timeout: 8000 });
  const btn = (n) => p.getByRole('button', { name: n }).filter({ visible: true }).first();
  const pick = async (label) => { await btn(/^Viewing /).click(); await p.getByRole('menuitem').filter({ hasText: label }).click(); };
  let fails = 0;
  const step = async (name, fn) => { try { await fn(); console.log('PASS', name); } catch (e) { fails++; console.log('FAIL', name, e.message.split('\n')[0]); } };

  await see('Neha!');
  await step('dropdown lists both views', async () => {
    await btn(/^Viewing /).click(); await p.screenshot({ path: `${out}/h0-dropdown.png` });
    if ((await p.getByRole('menuitem').count()) !== 2) throw new Error('menu items');
    await btn(/^Viewing /).click();
  });
  await step("switch to Sunita's phone (Marathi chat list)", async () => {
    await pick("Sunita's phone"); await see('चॅट'); await see('Pawsure');
    await p.screenshot({ path: `${out}/h1-home.png` });
  });
  await step('open chat, send photo check-in with the camera button', async () => {
    await btn(/^Pawsure chat/).click(); await see('बिझनेस अकाउंट');
    await btn('फोटो पाठवा').click(); await see('धन्यवाद! नोंद झाली.');
    await p.waitForTimeout(400); await p.screenshot({ path: `${out}/h2-chat.png` });
  });
  await step('Pawsure card: points, history, rights', async () => {
    await btn('Back to chats').click(); await see('माझे Pawsure कार्ड');
    await p.getByRole('button').filter({ hasText: 'माझे Pawsure कार्ड', visible: true }).first().click();
    await see('पॉइंटचा हिशोब'); await see('तुमचा डेटा');
    await p.screenshot({ path: `${out}/h3-card.png`, fullPage: false });
  });
  await step("switch back: Neha's Today shows the walk with evidence", async () => {
    await pick("Neha's app"); await see('Neha!');
    const walk = await p.getByRole('button').filter({ hasText: '4:00 pm · Sunita', visible: true }).first().innerText();
    if (!/Likely|Confirmed/.test(walk)) throw new Error('walk: ' + walk.slice(0, 80));
  });
  await step('helper stops from her card; owner sees it', async () => {
    await pick("Sunita's phone"); await p.getByRole('button').filter({ hasText: 'माझे Pawsure कार्ड', visible: true }).first().click();
    await btn('Pawsure थांबवा').click(); await see('सर्व घरांसाठी थांबवायचे?');
    await p.getByRole('button', { name: 'Pawsure थांबवा' }).filter({ visible: true }).first().click();
    await pick("Neha's app"); await see('Neha!');
    await p.getByText(/withdr|stopped|Stopped/i).filter({ visible: true }).first().waitFor({ timeout: 8000 });
  });
  console.log(fails ? `${fails} FAILED` : 'HELPER EXPERIENCE OK', '· page errors:', errs.length ? errs.join(' | ') : 0);
  await b.close();
})();
