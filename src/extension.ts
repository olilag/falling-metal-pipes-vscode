// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import path from "path";
import os from "os";
import { exec } from "child_process";
import findExec from "find-exec";

const log = vscode.window.createOutputChannel("Falling pipe", { log: true });

function getErrorMessage(error: unknown) {
	if (error instanceof Error) {
    return error.message;
  }
	return String(error);
}

function reportError(message: string) {
  vscode.window.showErrorMessage(message);
  log.error(message);
}

const linuxPlayers = ['ffplay', 'cvlc'];
const macPlayers = ['afplay'];
const winPlayers = ['powershell'];

const addPresentationCore = `Add-Type -AssemblyName presentationCore;`;
const createMediaPlayer = `$player = New-Object system.windows.media.mediaplayer;`;
const loadAudioFile = (path: string) => `$player.open('${path}');`;
const playAudio = `$player.Play();`;
const stopAudio = `Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`;

const playerCommands = new Map([
  ["ffplay", (path: string) => `ffplay -v 0 -nodisp -autoexit ${path}`],
  ["cvlc", (path: string) => `cvlc ${path} vlc://quit`],
  ["afplay", (path: string) => `afplay ${path}`],
  ["powershell", (path: string) => `powershell -c ${addPresentationCore} ${createMediaPlayer} ${loadAudioFile(
    path,
  )} ${playAudio} ${stopAudio}`],
]);

function choosePlayer() {
  let command;
  switch (os.platform()) {
    case "linux":
      command = findExec(linuxPlayers);
      if (command === null) {
        throw new Error("No cli audio players found");
      }
      return playerCommands.get(command)!;
    case "darwin":
      command = findExec(macPlayers);
      if (command === null) {
        throw new Error("No cli audio players found");
      }
      return playerCommands.get(command)!;
    case "win32":
      command = findExec(winPlayers);
      if (command === null) {
        throw new Error("No cli audio players found");
      }
      return playerCommands.get(command)!;
    default:
      throw new Error("Unsupported OS");
  }
}

function playMetalPipe(player: (path: string) => string) {
  try {
    log.appendLine("Playing metal pipe");
    console.log(player(path.join(__dirname, '../assets/metal-pipe.mp3')));
    exec(player(path.join(__dirname, '../assets/metal-pipe.mp3')));
  } catch (e) {
    reportError(getErrorMessage(e));
  }
}

function playGlassPipe(player: (path: string) => string) {
  try {
    log.appendLine("Playing glass pipe");
    exec(player(path.join(__dirname, '../assets/glass-pipe.mp3')));
  } catch (e) {
    reportError(getErrorMessage(e));
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  let documents = new Set<string>();
  const player = choosePlayer();

  vscode.workspace.onDidOpenTextDocument((event) => {
    const oldLength = documents.size;
    vscode.window.visibleTextEditors.forEach((d) => documents.add(d.document.fileName));
    if (documents.size > oldLength) {
      playMetalPipe(player);
    }
  });

  let oldVisible = vscode.window.visibleTextEditors.length;
  vscode.workspace.onDidCloseTextDocument((event) => {
    log.appendLine(`${oldVisible} ${vscode.window.visibleTextEditors.length}`);
    if (vscode.window.visibleTextEditors.length < oldVisible) {
      playGlassPipe(player);
      const docs = new Set(vscode.workspace.textDocuments.map((d)=>d.fileName));
      const newDocs = new Set<string>();
      for (const document of documents) {
        if (docs.has(document)) {
          newDocs.add(document);
        }
      }
      documents = newDocs;
    }
    oldVisible = vscode.window.visibleTextEditors.length;
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
