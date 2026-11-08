const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const body = fs.readFileSync(process.argv[2], 'utf8');
  const out = process.argv[3];
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body style="margin:0">${body}</body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 2600 } });
  const PAGE = 'https://artifact.test/x/v2/page';
  const blocked = [], errs = [];
  await p.route('**/*', (r) => (r.request().url() === PAGE ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : (blocked.push(r.request().url()), r.abort())));
  p.on('pageerror', (e) => errs.push(e.message));
  let n = 0, fails = 0;
  const step = async (name, fn) => {
    try { await fn(); console.log(`PASS ${name}`); }
    catch (e) { fails++; console.log(`FAIL ${name}: ${e.message.split('\n')[0]}`); await p.screenshot({ path: `${out}/fail-${++n}.png` }); }
  };
  const btn = (name) => p.getByRole('button', { name, exact: true }).filter({ visible: true }).last();
  const see = (t) => p.getByText(t).filter({ visible: true }).first().waitFor({ timeout: 6000 });
  const tab = (t) => p.getByRole('tab', { name: t, exact: true }).click();
  const back = () => p.getByRole('link', { name: 'Back' }).filter({ visible: true }).last().click();
  const row = (t) => p.getByRole('button').filter({ hasText: t, visible: true }).first();
  const jump = (label) => p.getByRole('button', { name: label }).filter({ visible: true }).first().click();
  const allScreens = async () => { await btn('All screens').click(); await see('Guided demos'); };

  await p.goto(PAGE);
  await step('1 onboarding: welcome, OTP, 6 steps', async () => {
    await see("When help can't come, ask friends."); await p.screenshot({ path: `${out}/welcome-v2.png` }); await btn('Get started').click();
    await p.getByLabel('Mobile number').fill('9876543210');
    await p.getByRole('checkbox').click();
    await btn('Get code').click();
    await see('Your demo code is 123456');
    await p.getByLabel('6-digit code').fill('111111'); await btn('Sign in').click(); await see('That code is not right');
    await p.getByLabel('6-digit code').fill('123456'); await btn('Sign in').click();
    await see('About you'); await btn('Continue').click();
    await see('Your privacy'); await p.getByRole('checkbox', { name: 'I have read the privacy notice' }).click(); await btn('Agree and continue').click();
    await see('Your pet'); await btn('Continue').click();
    await see("Bruno's care"); await btn('Continue').click();
    await see('Daily routine'); await btn('Continue').click();
    await see('Who helps');
  });
  await step('4 owner invites helper (language, why, preview)', async () => {
    await row('Not invited yet').click();
    await see('Why check-ins?');
    await btn('Send invite on WhatsApp (simulated)').click();
    await see('Invite sent, waiting for her answer');
  });
  await step('5 helper consents and picks a method', async () => {
    await btn("Open Sunita's phone (simulated)").click();
    await see('तुमची भाषा निवडा');
    await btn('हो').click();
    await see('तुम्ही कसे कळवाल?');
    await btn('फोटो').click();
    await see('झाले.');
    await btn("See Neha's Today screen").click();
    await see('Consent given');
    await btn('Continue').click();
    await see('Who helps');
    await btn('Invite co-owner').click();
    await btn('Finish setup').click();
    await see('Neha!'); await see('Good morning');
  });
  await step('2 owner adds a pet (empty state)', async () => {
    await p.getByRole('button', { name: 'Add a pet' }).click();
    await p.getByLabel('Name').fill('Mochi'); await btn('Add pet').click();
    await row('Mochi').click(); await see('No routine for Mochi yet');
    await row('Bruno').click(); await see("Who's caring today?");
  });
  await step('3 owner configures routine (adds 8 pm feed)', async () => {
    await p.getByRole('link', { name: 'Routine' }).first().click().catch(async () => p.getByText('Routine', { exact: true }).first().click());
    await see('When you\'re out');
    await btn('Add a task').click();
    await btn('Feeding').click(); await btn('8:00 pm').click();
    await p.getByLabel('Name (optional)').fill('Evening feed');
    await btn('Add task').click();
    await see('Evening feed');
    await back(); await see("Who's caring today?");
  });
  await step('6 photo check-in → walk Likely, lunch Confirmed', async () => {
    await jump('Jump to 3:45 pm');
    await allScreens(); await p.getByText('Helper on WhatsApp', { exact: true }).last().click();
    await btn('कोडसह फोटो').click(); await see('धन्यवाद! नोंद झाली.');
    await btn("See Neha's Today screen").click(); await see('Neha!');
    if (!(await row('4:00 pm · Sunita').innerText()).includes('Likely')) throw new Error('walk not Likely');
    if (!(await row('1:00 pm · Sunita').innerText()).includes('Confirmed')) throw new Error('lunch not Confirmed');
  });
  await step('10 missed alert at 7:30 (toilet pad)', async () => {
    await jump('Jump to 7:30 pm');
    await see('Change toilet pad: no check-in yet');
    if (!(await row('6:30 pm · Sunita').innerText()).includes('Missed')) throw new Error('pad not Missed');
  });
  await step('7 voice-note check-in (late) → pad Likely', async () => {
    await tab('Me'); await row('invite and consent').click();
    await p.getByRole('button', { name: /^Voice note/ }).click();
    await btn("Open Sunita's phone (simulated)").click();
    await btn('व्हॉइस नोट').click(); await see('उशिरा नोंद झाली');
    await btn("See Neha's Today screen").click(); await see('Neha!');
    await tab('Today');
    const t = await row('6:30 pm · Sunita').innerText();
    if (!t.includes('Likely') || !t.includes('Late')) throw new Error('pad: ' + t.slice(0, 80));
  });
  await step('8 missed call + code → Likely; 9 visit only → Not confirmed', async () => {
    await allScreens(); await p.getByText('Basic phone: missed call + code', { exact: true }).click();
    await btn('8:00 pm Evening feed').click();
    await btn('Missed call on arrival').click();
    await jump('Add 15 minutes');
    await btn('Missed call when leaving').click();
    await btn('1:00 pm Joint supplement').click();
    const code = (await p.getByText(/Today's code on the food-box card/).innerText()).match(/\d{4}/)[0];
    await btn('Missed call on arrival').click();
    for (const d of code) await btn(d).click();
    await btn('Send code').click();
    await back(); await back(); await see('Neha!');
    const feed = await row('8:00 pm · Sunita').innerText();
    if (!feed.includes('Not confirmed') || !/Someone came|visit/i.test(feed)) throw new Error('feed: ' + feed.slice(0, 120));
  });
  await step('11 owner return check → evening feed Matched', async () => {
    await btn('Return check').click(); await see('Welcome back');
    await btn('Empty').click(); await btn('Down').click(); await btn('Changed').click(); await btn('Normal').click();
    await btn('Save').click(); await see('Neha!');
    if (!(await row('8:00 pm · Sunita').innerText()).includes('Matched')) throw new Error('not matched');
  });
  await step('12 mismatch → helper disputes → owner releases', async () => {
    await row('1:00 pm · Sunita').click(); await see('Why this label');
    await btn('Flag a mismatch').click(); await see('Mismatch under review');
    await p.getByText('Open her phone (simulated)').click();
    await btn('I refilled the bowl after the photo').click();
    await back(); await see('Sunita replied at');
    await btn('Release: her explanation is fair').click(); await see('Points released');
    await back(); await see('Neha!');
  });
  await step('13 Trusted helper mode → Covered', async () => {
    await btn('Trusted helper mode').click(); await see('Not marked yet');
    await btn('Covered').click(); await see('Covered care day');
    await btn('Sunita (helper)').click();
  });
  await step('14 Ask Pawsure: parse, clarify key, top 3, approve', async () => {
    await jump('Jump to 3:45 pm');
    await tab('Find cover');
    await p.getByText(/My regular helper is unavailable tomorrow/).click();
    await btn('Ask Pawsure').click();
    await see('Check the details'); await see('Will they need a key?');
    await btn('Yes, key needed').click();
    await btn('Looks right, find friends').click();
    await see('Nearest suitable friends');
    const names = await p.locator('text=/^\\d\\. (Priya|Arjun|Meera|Kabir)$/').allInnerTexts();
    if (names[0] !== '1. Priya' || names.some((x) => /Kabir|Meera/.test(x))) throw new Error('ranking ' + names.join(','));
    await p.getByRole('button', { name: 'Select', exact: true }).filter({ visible: true }).first().click();
    await see('Message preview');
    await btn('Approve and send to 1').click(); await see('Sent. Waiting for a reply.');
  });
  await step('15 friend accepts → owner confirms', async () => {
    await btn("Open Priya's phone (simulated)").click();
    await btn('Yes').click(); await see('Waiting for Neha to confirm');
    await btn("Back to Neha's Find cover").click();
    await btn('Confirm Priya').click(); await see('Cover confirmed');
  });
  await step('16 friend rejects + proposes a time (reply parsing)', async () => {
    await btn('Cancel request').click(); await btn('New request').click();
    await p.getByText(/stuck in a meeting until 8/).click(); await btn('Ask Pawsure').click();
    await see('Morning or evening?'); await btn('5:00 pm').click();
    await btn('Looks right, find friends').click(); await see('Nearest suitable friends');
    await btn('Ask all 3').click(); await see('Sent. Waiting for a reply.');
    await p.getByRole('button', { name: /Open .*'s phone/ }).click();
    await btn('Arjun').click(); await btn('नहीं, माफ़ कीजिए').click(); await see('Saying no never counts against you');
    await btn('Meera').click(); await p.getByLabel('Reply as Meera').fill('5:30 la jamel'); await btn('Send reply').click();
    await btn("Back to Neha's Find cover").click();
    await see('Pawsure read this as: Can come at 5:30 pm');
    await p.getByRole('button', { name: /Accept Meera's time: 5:30 pm/ }).click(); await see('Cover confirmed');
  });
  await step('17 no friends available (medicine tomorrow 2 pm)', async () => {
    await btn('Cancel request').click(); await btn('New request').click();
    await p.getByText(/give Bruno his tablet/).click(); await btn('Ask Pawsure').click();
    await see('Check the details');
    await p.getByRole('button', { name: /Use the instructions from Bruno's profile/ }).click();
    await btn('Looks right, find friends').click();
    await see('No friend is free for this');
    if (!(await btn('Ask nearby ID-checked members').isDisabled())) throw new Error('nearby fallback not disabled');
  });
  await step('18 emergency reported by helper → urgent alert', async () => {
    await tab('Today'); await allScreens(); await p.getByText('Helper on WhatsApp', { exact: true }).last().click();
    await btn('अडचण कळवा').click(); await btn('दुखापत झाली').click(); await see('मालक आणि बॅकअपला कळवले आहे');
    await btn("See Neha's Today screen").click(); await see('Urgent: Hurt');
  });
  await step('19 day report', async () => { await btn('Day report').click(); await see('Day report'); await see('Tasks'); await back(); });
  await step('20 rewards wallet', async () => {
    await tab('Me'); await row('Rewards').click(); await see('Spendable'); await see('The rules'); await see('500 points = ₹20');
  });
  await p.screenshot({ path: `${out}/v2-end.png` });
  console.log(`\n${fails ? fails + ' FAILED' : 'ALL 20 SCENARIOS PASSED'} · blocked requests: ${blocked.length} · page errors: ${errs.length ? errs.join(' | ') : 0}`);
  await b.close();
})();
