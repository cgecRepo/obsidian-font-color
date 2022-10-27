import { FontColorSettings } from "src/settings/settingsData";
import { setAttributes } from "./setAttributes";

function addNewStyle(selector: any, style: any, sheet: HTMLElement) {
  sheet.textContent += selector + `{\n ${style}\n}\n\n`;
}

export function createStyles(settings: FontColorSettings) {
  let styleSheet = document.createElement("style");
  setAttributes(styleSheet, {
    type: "text/css",
    id: "highlightr-styles",
  });

  let header = document.getElementsByTagName("HEAD")[0];
  header.appendChild(styleSheet);

  Object.keys(settings.fontColors).forEach((fontColor) => {
    let colorLowercase = fontColor.toLowerCase();
    addNewStyle(
      `.hltr-${colorLowercase},\nmark.hltr-${colorLowercase},\n.markdown-preview-view mark.hltr-${colorLowercase}`,
      `background: ${settings.fontColors[fontColor]};`,
      styleSheet
    );
  });
}