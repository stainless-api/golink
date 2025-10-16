import browser from "webextension-polyfill";
import { getIsFinishedFirstOpen, setIsFinishedFirstOpen } from "../storage";

const ruleId = 1;

export async function updateRedirectRule(url: string) {
  console.debug("[updateRedirectRule] started");

  if (!url) {
    console.error(`[updateRedirectRule] golink url is empty: '${url}`);
    return;
  }

  let host;
  try {
    host = new URL(url).host;
  } catch (e) {
    console.error(`[updateRedirectRUle] invalid url: '${url}:`, e);
    return;
  }

  const redirectRule = {
    id: ruleId,
    priority: 1,
    action: {
      type: "redirect" as const,
      redirect: {
        transform: { scheme: "https", host: host },
      },
    },
    condition: {
      urlFilter: "*://go/*",
      resourceTypes: ["main_frame" as const],
    },
  };

  // Add a second rule to match paths with content after go/
  const redirectRuleWithPath = {
    id: ruleId + 1,
    priority: 1,
    action: {
      type: "redirect" as const,
      redirect: {
        transform: { scheme: "https", host: host },
      },
    },
    condition: {
      urlFilter: "*://go/*/*",
      resourceTypes: ["main_frame" as const],
    },
  };

  const updateRuleOptions = {
    removeRuleIds: [ruleId, ruleId + 1],
    addRules: [redirectRule, redirectRuleWithPath],
  };
  console.debug("[updateRedirectRule] updateRuleOptions", updateRuleOptions);

  console.debug(`[updateRedirectRule] updating redirect rule to ${url}`);
  await browser.declarativeNetRequest.updateDynamicRules(updateRuleOptions);

  // To tell the browser that http://go/ is a valid url.
  if (!(await getIsFinishedFirstOpen())) {
    await openGoTab(url);
  }

  console.debug("[updateRedirectRule] finished");
}

async function openGoTab(url: string) {
  console.debug(`[openGoTab] started`);

  if (!url.endsWith("/")) {
    url += "/";
  }
  const consoleUrl = url + "-/";

  const goTab = await browser.tabs.create({ url: "http://go/" });
  console.debug(`[openGoTab] opened http://go/:`, goTab);

  const onUpdated = (
    tabId: number,
    changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
    tab: browser.Tabs.Tab
  ) => {
    if (tabId === goTab.id && changeInfo.status === "complete") {
      console.debug("[openGoTab] loading goTab is completed", tab);

      browser.tabs.remove(tabId);
      console.debug("[openGoTab] removed goTab");

      browser.tabs.onUpdated.removeListener(onUpdated);
      console.debug(`[openGoTab] removed listener`);

      if (tab.url === consoleUrl) {
        console.debug(
          `[openGoTab] succeed to open and redirect http://go/ to ${consoleUrl}`
        );
        (async () => {
          await setIsFinishedFirstOpen(true);
        })();
      }
    }
  };

  browser.tabs.onUpdated.addListener(onUpdated);

  console.debug(`[openGoTab] finished`);
}
