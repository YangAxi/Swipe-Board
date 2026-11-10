import { test, expect, type Page } from "@playwright/test";
import { addDays, today } from "../../src/domain";
async function account(page: Page, name: string) {
  await page.getByRole("link", { name: "My Account", exact: true }).click();
  await page.getByRole("button", { name: new RegExp("^" + name) }).click();
}
async function publish(page: Page, type: "sell" | "buy", notes: string) {
  await page.getByRole("link", { name: "+ Post", exact: true }).click();
  await page.getByLabel("Post type").selectOption(type);
  await page.getByLabel("Los Angeles date").fill(addDays(today(), 1));
  await page.getByLabel("Start time", { exact: true }).fill("17:00");
  await page.getByLabel("End time", { exact: true }).fill("20:00");
  await page
    .getByRole("combobox", { name: "Dining hall", exact: true })
    .selectOption("De Neve");
  await page.getByLabel("Swipe quantity").fill("2");
  if (type === "sell") await page.getByLabel("Unit price").fill("8");
  await page.getByLabel("Notes").fill(notes);
  await page.getByRole("button", { name: "Publish demo post" }).click();
}
test("complete US1: guest, campus publish, combined filters, refresh, manage, ordinary permission", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /A little less/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "+ Post", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Choose demo account" }),
  ).toBeVisible();
  await account(page, "Alex");
  await publish(page, "sell", "Acceptance tomorrow offer");
  await expect(
    page.getByRole("heading", { name: "De Neve", exact: true }),
  ).toBeVisible();
  const url = page.url();
  await page.getByRole("button", { name: "Contact Seller" }).click();
  await expect(page.getByRole("status").last()).toContainText("own post");
  await account(page, "Guest");
  await page.getByRole("link", { name: "Browse", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Dining hall", exact: true })
    .selectOption("De Neve");
  await page.getByLabel("Max USD").fill("8");
  await page.getByLabel("From", { exact: true }).fill("18:00");
  await page.getByLabel("Until", { exact: true }).fill("19:00");
  await page
    .getByRole("combobox", { name: "Meal method", exact: true })
    .selectOption("Buffet Entry");
  await page
    .getByRole("combobox", { name: "Handoff method", exact: true })
    .selectOption("Meet at Entrance");
  await expect(
    page
      .locator(".listing-card")
      .filter({ hasText: "Acceptance tomorrow offer" }),
  ).toHaveCount(1);
  await page.reload();
  await expect(
    page
      .locator(".listing-card")
      .filter({ hasText: "Acceptance tomorrow offer" }),
  ).toHaveCount(1);
  await page.goto(url);
  await page.getByRole("button", { name: "Contact Seller" }).click();
  await expect(page.getByRole("status").last()).toContainText(
    "Choose a demo account",
  );
  await expect(page.locator("main")).not.toContainText("@");
  await account(page, "Alex");
  let card = page
    .locator(".cards>div")
    .filter({ hasText: "Acceptance tomorrow offer" });
  await card.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("link", { name: "Browse", exact: true }).click();
  await expect(
    page
      .locator(".listing-card")
      .filter({ hasText: "Acceptance tomorrow offer" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "My Account", exact: true }).click();
  card = page
    .locator(".cards>div")
    .filter({ hasText: "Acceptance tomorrow offer" });
  await card.getByRole("button", { name: "Reopen" }).click();
  await card.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Notes").fill("Edited acceptance offer");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText("Edited acceptance offer", { exact: true }),
  ).toBeVisible();
  await account(page, "Alex");
  card = page
    .locator(".cards>div")
    .filter({ hasText: "Edited acceptance offer" });
  await card.getByRole("button", { name: "Close", exact: true }).click();
  await page.goto(url);
  await expect(page.getByText("closed", { exact: true })).toBeVisible();
  await account(page, "Sam");
  await publish(page, "sell", "Ordinary denied");
  await expect(page.getByRole("alert")).toContainText("Only simulated campus");
  await expect(page.getByLabel("Notes")).toHaveValue("Ordinary denied");
  await page.getByLabel("Post type").selectOption("buy");
  await page.getByLabel("Minimum budget").fill("12");
  await page.getByLabel("Maximum budget").fill("8");
  await page.getByRole("button", { name: "Publish demo post" }).click();
  await expect(page.getByRole("alert")).toContainText("Minimum budget");
  await page.getByLabel("Minimum budget").fill("6");
  await page.getByRole("button", { name: "Publish demo post" }).click();
  await expect(
    page.getByRole("heading", { name: "De Neve", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Browse", exact: true }).click();
  await page.getByRole("button", { name: "Buy Swipes", exact: true }).click();
  await expect(
    page.locator(".listing-card").filter({ hasText: "Ordinary denied" }),
  ).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Dining hall", exact: true })
    .selectOption("The Study");
  await page.getByLabel("Max USD").fill("0");
  await expect(
    page.getByRole("heading", { name: "No swipes in this window" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .last()
    .click();
  await expect(page.locator(".listing-card").first()).toBeVisible();
  await page.getByRole("button", { name: "Sell Swipes", exact: true }).click();
  await expect(page.locator(".listing-card").first()).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-browse.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("storage corruption stays intact; explicit reset; write failure preserves input", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("swipe-board-demo", "damaged-data"),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Unable to load");
  expect(
    await page.evaluate(() => localStorage.getItem("swipe-board-demo")),
  ).toBe("damaged-data");
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Reset Demo Data", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My Account", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Alex/ }).click();
  await page.getByRole("link", { name: "+ Post", exact: true }).click();
  await page.getByLabel("Notes").fill("Preserve on quota error");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("quota", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Publish demo post" }).click();
  await expect(page.getByRole("alert")).toContainText("Not saved");
  await expect(page.getByLabel("Notes")).toHaveValue("Preserve on quota error");
});
test("invalid time is rejected; expired details and unauthorized edit stay protected", async ({
  page,
}) => {
  await page.goto("/");
  await account(page, "Alex");
  await page.getByRole("link", { name: "+ Post", exact: true }).click();
  await page.getByLabel("Start time", { exact: true }).fill("22:00");
  await page.getByLabel("End time", { exact: true }).fill("18:00");
  await page.getByRole("button", { name: "Publish demo post" }).click();
  await expect(page.getByRole("alert")).toContainText("end after start");
  await page.goto("/#detail/seed-9");
  await page.getByRole("button", { name: "Contact Buyer" }).click();
  await expect(page.getByRole("status").last()).toContainText("expired");
  await page.goto("/#edit/seed-1");
  await expect(
    page.getByText("You can only edit your own posts."),
  ).toBeVisible();
});
