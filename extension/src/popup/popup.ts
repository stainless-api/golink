import browser from "webextension-polyfill";
import { getGolinkUrl } from "../storage";

class GolinkPopup {
  url: string | null;

  constructor(url: string | null) {
    this.url = url;
    if (this.url && !this.url.endsWith("/")) {
      this.url += "/";
    }
  }

  public static async create(): Promise<GolinkPopup> {
    const url = await getGolinkUrl();
    return new GolinkPopup(url);
  }

  public async initialize() {
    const notConfiguredElem = document.getElementById("not-configured")!;
    const configuredElem = document.getElementById("configured")!;

    if (!this.url) {
      notConfiguredElem.hidden = false;
      configuredElem.hidden = true;
      return;
    }

    notConfiguredElem.hidden = true;
    configuredElem.hidden = false;

    // Get current tab URL to pre-fill
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0 && tabs[0].url) {
      this.currentTabUrl = tabs[0].url;
    }
  }

  public openConsole = async () => {
    let consoleUrl = this.url + "-/-/new";
    if (this.currentTabUrl) {
      const encodedUrl = encodeURIComponent(this.currentTabUrl);
      consoleUrl += `?url=${encodedUrl}`;
    }
    browser.tabs.create({ url: consoleUrl });
  };

  private currentTabUrl: string | null = null;
}

async function initialize() {
  const popup = await GolinkPopup.create();
  await popup.initialize();

  document
    .getElementById("open-console")
    ?.addEventListener("click", popup.openConsole);
  console.log("initialized");
}

initialize();
