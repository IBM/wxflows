const playwright = require("playwright");

async function getWebsiteContents(url, locator) {
  const browser = await playwright["chromium"].launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);

  const text = await page.locator(locator).innerText();

  await browser.close();

  console.log({ text });

  return text;
}

console.log(
  getWebsiteContents(
    "https://www.youtube.com/watch?v=l5K4r_TJz_8",
    "div#description-inner"
  )
);
