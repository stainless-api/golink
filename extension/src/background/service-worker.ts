import browser from "webextension-polyfill";
import { getGolinkUrl } from "../storage";
import { updateRedirectRule } from "./updateRedirectRule";

async function initialize() {
  console.debug("[initialize] started");

  const url = await getGolinkUrl();
  await updateRedirectRule(url);

  console.debug("[initialize] finished");
}

function onInstalled() {
  console.debug("[onInstalled] started");
  (async () => {
    try {
      await initialize();
    } catch (e) {
      console.error("[onInstalled]", e);
    }
  })();

  console.debug("[onInstalled] finished");
  return true;
}

browser.runtime.onInstalled.addListener(onInstalled);
