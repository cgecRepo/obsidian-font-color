import type FontColorPlugin from "../plugin/main";
import { Menu } from "obsidian";
import { FontColorSettings } from "src/settings/settingsData";
import fontColorMenu from "src/ui/fontColorMenu";
import { EnhancedApp, EnhancedEditor } from "src/settings/types";

export default function contextMenu(
  app: EnhancedApp,
  menu: Menu,
  editor: EnhancedEditor,
  plugin: FontColorPlugin,
  settings: FontColorSettings
): void {
  const selection = editor.getSelection();

  menu.addItem((item) => {
    const itemDom = (item as any).dom as HTMLElement;
    itemDom.addClass("font-color-button");
    item
      .setTitle("Font Color")
      .setIcon("font-color-pen")
      .onClick(async (e) => {
        fontColorMenu(app, settings, editor);
      });
  });

  if (selection) {
    menu.addItem((item) => {
      item
        .setTitle("Erase font color")
        .setIcon("font-color-eraser")
        .onClick((e) => {
          if (editor.getSelection()) {
            plugin.eraseFontColor(editor);
          }
        });
    });
  }
}