import { Menu, Notice } from "obsidian";
import { FontColorSettings } from "../settings/settingsData";
import { Coords,  EnhancedApp,  EnhancedEditor, EnhancedMenu} from "../settings/types";

const fontColorMenu = (
  app: EnhancedApp,
  settings: FontColorSettings,
  editor: EnhancedEditor
): void => {
  if (editor && editor.hasFocus()) {
    const cursor = editor.getCursor("from");
    let coords: Coords;

    const menu = new Menu() as unknown as EnhancedMenu;

    // menu.setUseNativeMenu(false);

    const menuDom = menu.dom;
    menuDom.addClass("fontColorContainer");

    settings.fontColorOrder.forEach((fontColor) => {
      menu.addItem((fontColorItem) => {
        fontColorItem.setTitle(fontColor);
        fontColorItem.setIcon(`font-color-pen-${fontColor}`.toLowerCase());
        fontColorItem.onClick(() => {
          console.log("Font color menu", fontColor)

          const id = `obsidian-font-color:${fontColor}`
          console.log(id)
          app.commands.executeCommandById(id);
        });
      });
    });

    if (editor.cursorCoords) {
      coords = editor.cursorCoords(true, "window");
    } else if (editor.coordsAtPos) {
      const offset = editor.posToOffset(cursor);
      coords = editor.cm.coordsAtPos?.(offset) ?? editor.coordsAtPos(offset);
    } else {
      return;
    }

    menu.showAtPosition({
      x: coords.right + 25,
      y: coords.top + 20,
    });
  } else {
    new Notice("Focus must be in editor");
  }
};

export default fontColorMenu;