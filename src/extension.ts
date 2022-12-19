// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as openai from 'openai';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const ai = new openai.OpenAIApi(new openai.Configuration({
		apiKey: process.env.OPENAI_API_KEY
	}));
	
	let disposable = vscode.commands.registerCommand('extension.chatGPT', () => {
		vscode.window.showInputBox({
			prompt: "Enter a question for ChatGPT"
		}).then(async (prompt) => {
			if (prompt) {
				try {
					const editor = vscode.window.activeTextEditor;
					if (!editor) {
						return undefined;
					}

					const selection = editor.selection;
					const code = editor.document.getText(selection);
					const completions = await ai.createCompletion({
						model: "text-davinci-003",
						prompt: !code ? `${prompt}` : `${prompt}\n<code>${code}</code>`,
						temperature: 0.7,
						max_tokens: 2048
					}, {
						timeout: 15000,
					});
					let message = completions.data.choices[0].text;
					vscode.window.showInformationMessage("Done!");
					const outputChannel = vscode.window.createOutputChannel('Ask GPT');
					outputChannel.appendLine(message!);
					outputChannel.show();
				}
				catch (err: any) {
					console.log();
					if (err.response) {
						console.log(err.response.status);
						console.log(err.response.data);
					}
					else {
						console.log(err.message);
					}
				}
			}
		});
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
