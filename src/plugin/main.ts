import { Editor, Menu, Notice, Plugin, PluginManifest } from 'obsidian';
import { wait } from "../utils/util"

import fontColorMenu from "../ui/fontColorMenu"
import { FontColorSettingTab } from "../settings/settingsTab";
import DEFAULT_SETTINGS, { FontColorSettings } from "../settings/settingsData";
import { EnhancedApp, EnhancedEditor } from "../settings/types";
import contextMenu from "./contextMenu";

import addIcons, { createFontColorIcons } from "../icons/customIcons";

import { createStyles } from "../utils/createStyles";


export default class FontColorPlugin extends Plugin {
	app: EnhancedApp;
	editor: EnhancedEditor;
	manifest: PluginManifest;
	settings: FontColorSettings;

	async onload() {
		console.log(`Highlightr v${this.manifest.version} loaded`);
		addIcons();
	
		this.app.workspace.onLayoutReady(() => {
		  this.reloadStyles(this.settings);
		  createFontColorIcons(this.settings, this);
		});

		// Agregamos la opcion de font color al editor menu (right click menu)
		this.registerEvent(
			this.app.workspace.on("editor-menu", this.handleFontColorInContextMenu)
		)
		
		this.addCommand({
			id: 'change-color',
			name: 'Change color',
			hotkeys: [{modifiers: ["Alt", "Shift"], key: "k"}],
			editorCallback: (editor: Editor) => {
				new Notice("Hotkey Refreshed 1");
				console.log("Refreshed 1")
				console.log(editor.getSelection());
				editor.replaceSelection('<font style="color:salmon">' + editor.getSelection() + '</font>');
			}
		});
	
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new FontColorSettingTab(this.app, this));

		// ESTE COMANDO ABRE EL FONT COLOR MENU
    	this.addCommand({
			id: "font-color-plugin-menu",
			name: "Open Font Color",
			icon: "font-color-pen",
			editorCallback: (editor: EnhancedEditor) => {
			!document.querySelector(".menu.fontColorContainer")
				? fontColorMenu(this.app, this.settings, editor)
				: true;
			},
		});

		addEventListener("FontColor-NewCommand", () => {
			this.reloadStyles(this.settings);
			this.generateCommands(this.editor);
			createFontColorIcons(this.settings, this);
		});
		
		this.generateCommands(this.editor);
		this.refresh();



		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			hotkeys: [{modifiers: ["Alt", "Shift"], key: "k"}],
			editorCallback: (editor: Editor) => {
				new Notice("Hotkey Refreshed 1");
				console.log("Refreshed 1")
				console.log(editor.getSelection());
				editor.replaceSelection('<font style="color:salmon">' + editor.getSelection() + '</font>');
			}
		});
	}
		
	reloadStyles(settings: FontColorSettings) {
		let currentSheet = document.querySelector("style#font-color-styles");
		if (currentSheet) {
			currentSheet.remove();
			createStyles(settings);
		} else {
			createStyles(settings);
		}
	}
		
	eraseFontColor = (editor: Editor) => {
		const currentStr = editor.getSelection();
		const newStr = currentStr
			.replace(/\<font style.*?[^\>]\>/g, "")
			.replace(/\<font class.*?[^\>]\>/g, "")
			.replace(/\<\/font>/g, "");
		editor.replaceSelection(newStr);
		editor.focus();
	};

	generateCommands(editor: Editor) {
		this.settings.fontColorOrder.forEach((fontColorKey: string) => {
			const applyCommand = (command: CommandPlot, editor: Editor) => {
				const selectedText = editor.getSelection();
				const curserStart = editor.getCursor("from");
				const curserEnd = editor.getCursor("to");
				const prefix = command.prefix;
				const suffix = command.suffix || prefix;
				const setCursor = (mode: number) => {
					editor.setCursor(
					curserStart.line + command.line * mode,
					curserEnd.ch + cursorPos * mode
					);
				};
				const cursorPos =
					selectedText.length > 0
						? prefix.length + suffix.length + 1
						: prefix.length;
				const preStart = {
					line: curserStart.line - command.line,
					ch: curserStart.ch - prefix.length,
				};
				const pre = editor.getRange(preStart, curserStart);
		
				const sufEnd = {
					line: curserStart.line + command.line,
					ch: curserEnd.ch + suffix.length,
				};
		
				const suf = editor.getRange(curserEnd, sufEnd);
		
				const preLast = pre.slice(-1);
				const prefixLast = prefix.trimStart().slice(-1);
				const sufFirst = suf[0];
		
				if (suf === suffix.trimEnd()) {
					if (preLast === prefixLast && selectedText) {
						editor.replaceRange(selectedText, preStart, sufEnd);
						const changeCursor = (mode: number) => {
							editor.setCursor(
								curserStart.line + command.line * mode,
								curserEnd.ch + (cursorPos * mode + 8)
							);
						};
						
						return changeCursor(-1);
					}
				}
		
				editor.replaceSelection(`${prefix}${selectedText}${suffix}`);
		
				return setCursor(1);
			};
	
			type CommandPlot = {
				char: number;
				line: number;
				prefix: string;
				suffix: string;
			};

			type commandsPlot = {
				[key: string]: CommandPlot;
			};

			const commandsMap: commandsPlot = {
				fontColor: {
					char: 34,
					line: 0,
					prefix:
					this.settings.fontColorMethods === "css-classes"
						? `<font class="hltr-${fontColorKey.toLowerCase()}">`
						: `<font style="color: ${this.settings.fontColors[fontColorKey]};">`,
					suffix: "</font>",
				},
			};

			Object.keys(commandsMap).forEach((type) => {
				let fontColorpen = `font-color-pen-${fontColorKey}`.toLowerCase();
				this.addCommand({
					id: fontColorKey,
					name: fontColorKey,
					icon: fontColorpen,
					editorCallback: async (editor: Editor) => {
					applyCommand(commandsMap[type], editor);
					await wait(10);
					editor.focus();
					},
				});
			});

			this.addCommand({
				id: "uncolor",
				name: "Remove color",
				icon: "font-color-eraser",
				editorCallback: async (editor: Editor) => {
					this.eraseFontColor(editor);
					editor.focus();
				},
			});
		});
	}
	
	refresh = () => {
		this.updateStyle();
	};

	updateStyle = () => {
	  document.body.classList.toggle(
		"font-color-lowlight",
		this.settings.fontColorStyle === "lowlight"
	  );
	  
	  document.body.classList.toggle(
		"font-color-floating",
		this.settings.fontColorStyle === "floating"
	  );
	  
	  document.body.classList.toggle(
		"font-color-rounded",
		this.settings.fontColorStyle === "rounded"
	  );

	  document.body.classList.toggle(
		"font-color-realistic",
		this.settings.fontColorStyle === "realistic"
	  );
	};

	onunload() {
		console.log("Font color unloaded")
	}
	
	handleFontColorInContextMenu = (
		menu: Menu,
		editor: EnhancedEditor
	): void => {
			contextMenu(this.app, menu, editor, this, this.settings);
	};

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
