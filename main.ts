// import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { promises as fs } from 'fs';
import 'obsidian';
import { App, Editor, MarkdownView, Modal, Notice, PluginSettingTab, Setting } from 'obsidian';


const snippetsFile = './powershell-snippets.json';
const snippets = JSON.parse(fs.readFile(snippetsFile, 'utf8'));

// eslint-disable-next-line @typescript-eslint/no-unused-vars

// The main class for the Obsidian plugin
export default class CalvinsObsidianSnippets extends Plugin {
  settings: PluginSettings;

  extractLanguage = (source: string): string => {
    const match = RegExp(/```(\w+)/).exec(source);
    return match? match[1].toLowerCase() : '';
  }

  findMatchingSnippet = (language: string): string | undefined => {
    return snippets.find((snippet: { language: string; }) => snippet.language === language)?.body.join('\n');
  }

  // Open the modal with the available snippets for the given language
  async openModal(options: string[], view: MarkdownView): Promise<void> {
    const { contentEl, titleEl, toggleButton } = new Modal(this.app);
    titleEl.setText('Select Snippet');
    toggleButton.setText('Cancel');

    for (const option of options) {
      const button = this.createButton(option);
      button.addEventListener('click', () => {
        const matchingSnippet = this.findMatchingSnippet(option);
        if (matchingSnippet) {
          this.insertSnippet(view.editor, matchingSnippet);
        }
        this.closeModal();
      });
      contentEl.appendChild(button);
    }

    this.registerModal(titleEl, contentEl);
  }
	closeModal() {
		throw new Error('Method not implemented.');
	}
	registerModal(titleEl: HTMLElement, contentEl: HTMLElement) {
		throw new Error('Method not implemented.');
	}

  async insertSnippet(editor: Editor, snippet: string): Promise<void> {
    const selection = editor.getSelection();
    const position = editor.getCursor();
    editor.replaceSelection(snippet, 'around');
    editor.setSelection(position.line, selection.start, position.line, selection.end);
  }

  createButton = (text: string): HTMLButtonElement => {
    const button = document.createElement('button');
    button.classList.add('button', 'button-small');
    button.textContent = text;
    return button;
  }

  // Load settings when the plugin is initialized
  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData()};
  }

  // Save settings when the plugin is unloaded
  async saveSettings() {
    await this.saveData(this.settings);
  }

  // The onLoad method is called when the plugin is loaded
  async onload() {
    await this.loadSettings();

    // Add a ribbon icon to the Obsidian interface
    this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
      new Notice('This is a notice!');
    });

    // Add a status bar item to the Obsidian interface
    this.addStatusBarItem().setText('Status Bar Text');

    // Define a command to insert a snippet into the editor
    this.addCommand({
      id: 'insert-snippet',
      name: 'Insert Snippet',
      // Define the editor callback for the command
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        const selection = editor.getSelection();
        const language = this.extractLanguage(selection);
        if (!language) {
          new Notice('Please select a code block with a language identifier');
          return;
        }
        const matchingSnippet = this.findMatchingSnippet(language);
        if (matchingSnippet) {
          await this.insertSnippet(editor, matchingSnippet);
        } else {
          new Notice(`No snippet found for language: ${language}`);
        }
      },
      // Define the view callback for the command
      viewCallback: (view: MarkdownView) => {
        const position = view.getCursor();
        const language = this.extractLanguage(view.getLine(position.line));
        if (language) {
          const options = snippets.filter((snippet: { language: string; }) => snippet.language === language).map((snippet: { name: unknown; }) => snippet.name);
          return this.openModal(options, view);
        }
      }
    });

    // Register the plugin settings tab
    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  // The onunload method is called when the plugin is unloaded
  onunload() {
    console.log('unloading plugin');
  }
}

interface PluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  mySetting: 'default'
};

// The settings tab for the plugin
class SampleSettingTab extends PluginSettingTab {
  plugin: CalvinsObsidianSnippets;

  constructor(app: App, plugin: CalvinsObsidianSnippets) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Add a setting to the settings tab
    new Setting(containerEl)
    .setName('Setting #1')
    .setDesc('This is a description for setting #1')
    .addText(text => text.setPlaceholder('Enter something')
    .setValue(this.plugin.settings.mySetting)
    .onChange(async (value) => {
      this.plugin.settings.mySetting = value;
      await this.plugin.saveSettings();
    }));
  }
}