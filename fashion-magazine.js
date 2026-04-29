// fashion-magazine.js

module.exports = async function runFashionMagazine(page) {
  const eventUrl = process.env.LP_FASHION_MAGAZINE_URL;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📰 [FM] Fashion Magazine script initialized");

  if (!eventUrl || eventUrl === 'OFF') {
    console.log("⏭️ [FM] Skipped: LP_FASHION_MAGAZINE_URL is missing or OFF");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return;
  }

  console.log(`🔗 [FM] Event URL: ${eventUrl}`);
  console.log("🟢 [FM] Entering main loop");

  let cycle = 0;

  while (true) {
    cycle++;
    console.log("────────────────────────────────────────");
    console.log(`🔄 [FM] Cycle #${cycle} started`);

    try {
      /* ───────── STEP 1: OPEN PAGE ───────── */

      console.log("🌐 [FM] Navigating to event page...");
      await page.goto(eventUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      console.log("⏳ [FM] Waiting 5s for page stabilization...");
      await page.waitForTimeout(5000);

      /* ───────── STEP 1: PRICE CHECK ───────── */

      console.log("🔍 [FM] Looking for price information...");
      const priceInfo = await page.$('.price-wrapper .square-price-tag');

      if (!priceInfo) {
        console.log("❌ [FM] Price element NOT found in DOM");
        console.log("🛑 [FM] Stopping script (cannot determine currency)");
        break;
      }

      const priceClass = await priceInfo.getAttribute('class');
      const priceText = (await priceInfo.innerText()).trim();

      console.log(`💰 [FM] Price text detected: "${priceText}"`);
      console.log(`🏷️ [FM] Price class detected: "${priceClass}"`);

      if (!priceClass.includes('icon-currency-emeralds')) {
        console.log("💎 [FM] Currency is NOT emeralds");
        console.log("🚫 [FM] Diamonds detected — refusing to click");
        console.log("🛑 [FM] Exiting Fashion Magazine loop safely");
        break;
      }

      console.log("🟢 [FM] Emerald price confirmed — proceeding");

      /* ───────── STEP 2: GRID READ ───────── */

      console.log("🧩 [FM] Waiting for grid to be visible...");
      await page.waitForSelector('.zone-grid .square', { timeout: 30000 });

      console.log("📥 [FM] Reading grid state...");
      const gridData = await page.$$eval(
        '.zone-grid .square',
        squares =>
          squares.map(square => {
            const cls = square.className;
            if (cls.includes('opened') && cls.includes('completed')) return 2;
            if (cls.includes('opened')) return 1;
            return 0;
          })
      );

      console.log(`📊 [FM] Total grid cells found: ${gridData.length}`);

      if (gridData.length !== 121) {
        console.log("⚠️ [FM] Grid size mismatch!");
        console.log(`❗ [FM] Expected 121 cells, got ${gridData.length}`);
        console.log("🛑 [FM] Stopping to avoid mis-clicks");
        break;
      }

      /* ───────── GRID ANALYSIS ───────── */

      let closedCount = 0;
      let openedEmptyCount = 0;
      let completedCount = 0;

      gridData.forEach(v => {
        if (v === 0) closedCount++;
        if (v === 1) openedEmptyCount++;
        if (v === 2) completedCount++;
      });

      console.log("🧮 [FM] Grid state summary:");
      console.log(`    ⬜ Closed squares     : ${closedCount}`);
      console.log(`    🟨 Opened (empty)     : ${openedEmptyCount}`);
      console.log(`    🟩 Opened (completed) : ${completedCount}`);

      /* ───────── CLOSED SQUARE SELECTION ───────── */

      const closedIndexes = [];
      gridData.forEach((val, idx) => {
        if (val === 0) closedIndexes.push(idx);
      });

      console.log(`🎯 [FM] Closed square indexes available: ${closedIndexes.length}`);

      if (closedIndexes.length === 0) {
        console.log("✅ [FM] No closed squares left");
        console.log("🏁 [FM] Grid fully explored — stopping");
        break;
      }

      const randomIndex =
        closedIndexes[Math.floor(Math.random() * closedIndexes.length)];

      console.log(`🎲 [FM] Randomly selected square index: ${randomIndex}`);

      /* ───────── CLICK ACTION ───────── */

      const squares = await page.$$('.zone-grid .square');

      console.log("🖱️ [FM] Scrolling selected square into view...");
      await squares[randomIndex].scrollIntoViewIfNeeded();

      console.log("🖱️ [FM] Clicking selected square...");
      await squares[randomIndex].click();

      console.log("⏳ [FM] Waiting 8s for server response...");
      await page.waitForTimeout(8000);

      console.log("🔁 [FM] Cycle completed successfully");
      console.log("🔄 [FM] Re-checking price for next cycle...");

    } catch (err) {
      console.log("❌ [FM] UNHANDLED ERROR OCCURRED");
      console.log(`💥 [FM] Error message: ${err.message}`);
      console.log("📸 [FM] Taking screenshot: fashion-magazine-error.png");

      await page.screenshot({
        path: 'fashion-magazine-error.png',
        fullPage: true
      });

      console.log("🛑 [FM] Exiting loop due to error");
      break;
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🏁 [FM] Fashion Magazine script finished");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
};
