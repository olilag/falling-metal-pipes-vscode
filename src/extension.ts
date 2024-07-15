// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import path from "path";

function playMetalPipe() {
  require('child_process').exec(`ffplay -v 0 -nodisp -autoexit ${path.join(__dirname, '../assets/metal-pipe.mp3')}`);
}

function playGlassPipe() {
  require('child_process').exec(`ffplay -v 0 -nodisp -autoexit ${path.join(__dirname, '../assets/glass-pipe.mp3')}`);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  let documents = new Set<string>();

  vscode.workspace.onDidOpenTextDocument((event) => {
    const oldLength = documents.size;
    documents.add(vscode.window.visibleTextEditors[0].document.fileName);
    if (documents.size > oldLength) {
      playMetalPipe();
    }
  });

  vscode.workspace.onDidCloseTextDocument((event) => {
    if (vscode.window.visibleTextEditors.length === 0) {
      playGlassPipe();
      const docs = new Set(vscode.workspace.textDocuments.map((d)=>d.fileName));
      const newDocs = new Set<string>();
      for (const document of documents) {
        if (docs.has(document)) {
          newDocs.add(document);
        }
      }
      documents = newDocs;
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
