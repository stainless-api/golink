import browser from "webextension-polyfill";
import { getGolinkUrl } from "../storage";

class GolinkPopup {
  url: string;
  private currentTabUrl: string | null = null;

  constructor(url: string) {
    this.url = url.endsWith("/") ? url : url + "/";
  }

  public static async create(): Promise<GolinkPopup> {
    const url = await getGolinkUrl();
    return new GolinkPopup(url);
  }

  public async initialize() {
    // Get current tab URL to pre-fill
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0 && tabs[0].url) {
      this.currentTabUrl = tabs[0].url;

      // Update description with the URL (bold the URL)
      const descriptionElem = document.getElementById("description");
      if (descriptionElem) {
        descriptionElem.innerHTML = `Add <strong>${this.currentTabUrl}</strong> to golinks`;
      }
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
