import type FontColorPlugin from "../plugin/main";
import { App, Setting, PluginSettingTab, Notice, TextComponent} from "obsidian";
import Pickr from "@simonwep/pickr";
import * as Sortable from "sortablejs";
import { FONT_COLOR_METHODS, FONT_COLOR_STYLES } from "./settingsData";
import { setAttributes } from "src/utils/setAttributes";

export class FontColorSettingTab extends PluginSettingTab {
    plugin: FontColorPlugin;
    appendMethod: string;

    constructor(app: App, plugin: FontColorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h1", { text: "Font Color" });
        containerEl.createEl("p", { text: "Created by " }).createEl("a", {
            text: "Chetachi 👩🏽‍💻",
            href: "https://github.com/chetachiezikeuzor",
        });
        containerEl.createEl("h2", { text: "Plugin Settings" });

        new Setting(containerEl)
            .setName("Choose highlight method")
            .setDesc(
                `Choose between highlighting with inline CSS or CSS classes. Please note that there are pros and cons to both choices. Inline CSS will keep you from being reliant on external CSS files if you choose to export your notes. CSS classes are more flexible and easier to customize.`
            )
            .addDropdown((dropdown) => {
                let methods: Record<string, string> = {};
                FONT_COLOR_METHODS.map((method) => (methods[method] = method));
                dropdown.addOptions(methods);
                dropdown
                .setValue(this.plugin.settings.fontColorMethods)
                .onChange((highlightrMethod) => {
                    this.plugin.settings.fontColorMethods = highlightrMethod;
                    setTimeout(() => {
                        dispatchEvent(new Event("Highlightr-NewCommand"));
                    }, 100);
                    this.plugin.saveSettings();
                    this.plugin.saveData(this.plugin.settings);
                    this.display();
                });
            });

        const stylesSetting = new Setting(containerEl);

        stylesSetting
            .setName("Choose highlight style")
            .setDesc(
                `Depending on your design aesthetic, you may want to customize the style of your highlights. Choose from an assortment of different highlighter styles by using the dropdown. Depending on your theme, this plugin's CSS may be overriden.`
            )
            .addDropdown((dropdown) => {
                let styles: Record<string, string> = {};
                FONT_COLOR_STYLES.map((style) => (styles[style] = style));
                dropdown.addOptions(styles);
                dropdown
                .setValue(this.plugin.settings.fontColorStyle)
                .onChange((fontColorStyle) => {
                    this.plugin.settings.fontColorStyle = fontColorStyle;
                    this.plugin.saveSettings();
                    this.plugin.saveData(this.plugin.settings);
                    this.plugin.refresh();
                });
            });

        const styleDemo = () => {
            const d = createEl("p");
            d.setAttribute("style", "font-size: .925em; margin-top: 12px;");
            d.innerHTML = `
            <span style="background:#FFB7EACC;padding: .125em .125em;--lowlight-background: var(--background-primary);border-radius: 0;background-image: linear-gradient(360deg,rgba(255, 255, 255, 0) 40%,var(--lowlight-background) 40%) !important;">Lowlight</span> 
            <span style="background:#93C0FFCC;--floating-background: var(--background-primary);border-radius: 0;padding-bottom: 5px;background-image: linear-gradient(360deg,rgba(255, 255, 255, 0) 28%,var(--floating-background) 28%) !important;">Floating</span> 
            <span style="background:#9CF09CCC;margin: 0 -0.05em;padding: 0.1em 0.4em;border-radius: 0.8em 0.3em;-webkit-box-decoration-break: clone;box-decoration-break: clone;text-shadow: 0 0 0.75em var(--background-primary-alt);">Realistic</span> 
            <span style="background:#CCA9FFCC;margin: 0 -0.05em;padding: 0.125em 0.15em;border-radius: 0.2em;-webkit-box-decoration-break: clone;box-decoration-break: clone;">Rounded</span>`;
            return d;
        };

        stylesSetting.infoEl.appendChild(styleDemo());

        const fontColorSetting = new Setting(containerEl);

        fontColorSetting
            .setName("Choose highlight colors")
            .setClass("highlighterplugin-setting-item")
            .setDesc(
                `Create new highlight colors by providing a color name and using the color picker to set the hex code value. Don't forget to save the color before exiting the color picker. Drag and drop the highlight color to change the order for your highlighter component.`
            );

        const colorInput = new TextComponent(fontColorSetting.controlEl);
        colorInput.setPlaceholder("Color name");
        colorInput.inputEl.addClass("highlighter-settings-color");

        const valueInput = new TextComponent(fontColorSetting.controlEl);
        valueInput.setPlaceholder("Color hex code");
        valueInput.inputEl.addClass("highlighter-settings-value");

        fontColorSetting
            .addButton((button) => {
                button.setClass("highlightr-color-picker");
            })
            .then(() => {
                let input = valueInput.inputEl;
                let currentColor = valueInput.inputEl.value || null;

                const colorMap = this.plugin.settings.fontColorOrder.map(
                (fontColorKey) => this.plugin.settings.fontColors[fontColorKey]
                );

                let colorHex;
                let pickrCreate = new Pickr({
                el: ".highlightr-color-picker",
                theme: "nano",
                swatches: colorMap,
                defaultRepresentation: "HEXA",
                default: colorMap[colorMap.length - 1],
                comparison: false,
                components: {
                    preview: true,
                    opacity: true,
                    hue: true,
                    interaction: {
                    hex: true,
                    rgba: true,
                    hsla: false,
                    hsva: false,
                    cmyk: false,
                    input: true,
                    clear: true,
                    cancel: true,
                    save: true,
                    },
                },
                });

                pickrCreate
                .on("clear", function (instance: Pickr) {
                    instance.hide();
                    input.trigger("change");
                })
                .on("cancel", function (instance: Pickr) {
                    currentColor = instance.getSelectedColor().toHEXA().toString();

                    input.trigger("change");
                    instance.hide();
                })
                .on("change", function (color: Pickr.HSVaColor) {
                    colorHex = color.toHEXA().toString();
                    let newColor;
                    colorHex.length == 6
                    ? (newColor = `${color.toHEXA().toString()}A6`)
                    : (newColor = color.toHEXA().toString());
                    colorInput.inputEl.setAttribute(
                    "style",
                    `background-color: ${newColor}; color: var(--text-normal);`
                    );

                    setAttributes(input, {
                    value: newColor,
                    style: `background-color: ${newColor}; color: var(--text-normal);`,
                    });
                    input.setText(newColor);
                    input.textContent = newColor;
                    input.value = newColor;
                    input.trigger("change");
                })
                .on("save", function (color: Pickr.HSVaColor, instance: Pickr) {
                    let newColorValue = color.toHEXA().toString();

                    input.setText(newColorValue);
                    input.textContent = newColorValue;
                    input.value = newColorValue;
                    input.trigger("change");

                    instance.hide();
                    instance.addSwatch(color.toHEXA().toString());
                });
            })
            .addButton((button) => {
                button
                .setClass("HighlightrSettingsButton")
                .setClass("HighlightrSettingsButtonAdd")
                .setIcon("highlightr-save")
                .setTooltip("Save")
                .onClick(async (buttonEl: any) => {
                    let color = colorInput.inputEl.value.replace(" ", "-");
                    let value = valueInput.inputEl.value;

                    if (color && value) {
                    if (!this.plugin.settings.fontColorOrder.includes(color)) {
                        this.plugin.settings.fontColorOrder.push(color);
                        this.plugin.settings.fontColors[color] = value;
                        setTimeout(() => {
                        dispatchEvent(new Event("Font-Color-NewCommand"));
                        }, 100);
                        await this.plugin.saveSettings();
                        this.display();
                    } else {
                        buttonEl.stopImmediatePropagation();
                        new Notice("This color already exists");
                    }
                    }
                    color && !value
                    ? new Notice("Highlighter hex code missing")
                    : !color && value
                    ? new Notice("Highlighter name missing")
                    : new Notice("Highlighter values missing"); // else
                });
            });

        const fontColorsContainer = containerEl.createEl("div", {
            cls: "FontColorSettingsTabsContainer",
        });

        Sortable.create(fontColorsContainer, {
            animation: 500,
            ghostClass: "highlighter-sortable-ghost",
            chosenClass: "highlighter-sortable-chosen",
            dragClass: "highlighter-sortable-drag",
            dragoverBubble: true,
            forceFallback: true,
            fallbackClass: "highlighter-sortable-fallback",
            easing: "cubic-bezier(1, 0, 0, 1)",
            /*onSort: (command: { oldIndex: number; newIndex: number }) => {
                const arrayResult = this.plugin.settings.fontColorOrder;
                const [removed] = arrayResult.splice(command.oldIndex, 1);
                arrayResult.splice(command.newIndex, 0, removed);
                this.plugin.settings.fontColorOrder = arrayResult;
                this.plugin.saveSettings();
            },*/
        });

        this.plugin.settings.fontColorOrder.forEach((fontColor) => {
        const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill=${this.plugin.settings.fontColors[fontColor]} stroke=${this.plugin.settings.fontColors[fontColor]} stroke-width="0" stroke-linecap="round" stroke-linejoin="round"><path d="M20.707 5.826l-3.535-3.533a.999.999 0 0 0-1.408-.006L7.096 10.82a1.01 1.01 0 0 0-.273.488l-1.024 4.437L4 18h2.828l1.142-1.129l3.588-.828c.18-.042.345-.133.477-.262l8.667-8.535a1 1 0 0 0 .005-1.42zm-9.369 7.833l-2.121-2.12l7.243-7.131l2.12 2.12l-7.242 7.131zM4 20h16v2H4z"/></svg>`;
        const settingItem = fontColorsContainer.createEl("div");
        settingItem.addClass("font-solor-item-draggable");
        const colorIcon = settingItem.createEl("span");
        colorIcon.addClass("font-color-setting-icon");
        colorIcon.innerHTML = icon;

        new Setting(settingItem)
            .setClass("font-color-setting-item")
            .setName(fontColor)
            .setDesc(this.plugin.settings.fontColors[fontColor])
            .addButton((button) => {
                button
                    .setClass("HighlightrSettingsButton")
                    .setClass("HighlightrSettingsButtonDelete")
                    .setIcon("highlightr-delete")
                    .setTooltip("Remove")
                    .onClick(async () => {
                        new Notice(`${fontColor} color deleted`);
                        (this.app as any).commands.removeCommand(
                            `highlightr-plugin:${fontColor}`
                        );
                        delete this.plugin.settings.fontColors[fontColor];
                        this.plugin.settings.fontColorOrder.remove(fontColor);
                        setTimeout(() => {
                            dispatchEvent(new Event("Font-Color-NewCommand"));
                        }, 100);
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });

        const a = createEl("a");
            a.setAttribute("href", "");
        });
        const hltrDonationDiv = containerEl.createEl("div", {
            cls: "hltrDonationSection",
        });
    }
}