import { test, expect } from "@playwright/test";

test("repository subpath loads assets, supports publishing and survives hash-route refresh", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: /A little less searching/ }),
  ).toBeVisible();
  await expect(page.locator(".demo-bar")).toContainText("DEMO");
  // Verify CSS is loaded, not merely the HTML shell.
  await expect(page.locator(".hero")).toHaveCSS("display", "flex");
  await page.getByRole("link", { name: "My Account", exact: true }).click();
  await page.getByRole("button", { name: /^Alex/ }).click();
  await page.getByRole("link", { name: "+ Post", exact: true }).click();
  await page.getByLabel("Notes").fill("Pages deployment smoke");
  await page.getByRole("button", { name: "Publish demo post" }).click();
  await expect(
    page.getByText("Pages deployment smoke", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/Swipe-Board\/#detail\//);
  await page.reload();
  await expect(
    page.getByText("Pages deployment smoke", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(failures).toEqual([]);
});
