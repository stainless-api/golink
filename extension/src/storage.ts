import browser from "webextension-polyfill";

// Hardcoded Stainless golink instance
const GOLINK_URL = "https://go.stainless.com";
const isFinishedFirstOpenKey = "isFinishedFirstOpen" as const;

export async function getGolinkUrl(): Promise<string> {
  return GOLINK_URL;
}

export async function getIsFinishedFirstOpen(): Promise<boolean> {
  const result = await browser.storage.local.get(isFinishedFirstOpenKey);
  return result && result[isFinishedFirstOpenKey] ? true : false;
}

export async function setIsFinishedFirstOpen(isFinished: boolean): Promise<void> {
  await browser.storage.local.set({ [isFinishedFirstOpenKey]: isFinished });
}
