/*---------------------------------------------------------------------------------------------
 *  based on https://github.com/microsoft/vscode-extension-samples/blob/master/fsprovider-sample/src/fileSystemProvider.ts
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Session } from './Session';
import { Directory } from './Directory';
import { File } from './File';
import JadeServer from './JadeServer';

export type Entry = File | Directory;

function str2ab(str: string): Uint8Array {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return bufView;
}

export class GemStoneFS implements vscode.FileSystemProvider {
    session: Session;
    jadeServer: number;
    map: Map<any, any>;
    constructor(session: Session) {
        this.session = session;
        this.jadeServer = 1;    // OOP_ILLEGAL
        this.map = new Map();
        // obtain list of SymbolDictionary instances
        try {
            this.jadeServer = session.oopFromExecuteString(JadeServer);
            const myString = session.stringFromPerform(this.jadeServer, 'getSymbolList', [], 1024);
		    const list = JSON.parse(myString).list.map((each: any) => {
                const uri = vscode.Uri.parse('gs' + session.sessionId.toString() + ':/' + each.name);
                const dict = new Directory(session, each.name, each);
                this.map.set(uri.toString(), dict);
                return {
                    'uri': uri, 
                    'name': each.name
                };
            });
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const flag = vscode.workspace.updateWorkspaceFolders(
                workspaceFolders ? workspaceFolders.length : 0,
                0, 
                ...list
            );
            if (!flag) {
                console.error('Unable to create workspace folder!');
                vscode.window.showErrorMessage('Unable to create workspace folder!');
                return;
            }
        } catch(e) {
            console.error(e.message);
        }
    }

    // --- manage file metadata

    // return a FileStat-type (ctime: number, mtime: number, size: number, type: FileType)
    stat(uri: vscode.Uri): vscode.FileStat {
        if (uri.toString().includes('.vscode')) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        const entry = this.map.get(uri.toString());
        if (!entry) {
            console.error('stat(\'' + uri.toString() + '\') entry not found!');
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        return entry;
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
        const result: [string, vscode.FileType][] = new Array;
        try {
            const dict = this.map.get(uri.toString());
            const myString = this.session.stringFromPerform(
                this.jadeServer, 
                'getDictionary:', 
                [dict.oop], 
                65525
            );
            JSON.parse(myString).list.forEach((element: any) => {
                const newUri = vscode.Uri.parse(uri.toString() + '/' + element.key);
                const global = new File(this.session, element.key, element);
                this.map.set(newUri.toString(), global);
                result.push([element.key, vscode.FileType.File]);
            });
        } catch(e) {
            console.error(e.message);
        }
        return result;
    }

    // --- manage file contents

    readFile(uri: vscode.Uri): Uint8Array {
        if (uri.toString().includes('.vscode')) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        const entry = this.map.get(uri.toString());
        if (!entry) {
            console.error('stat(\'' + uri.toString() + '\') entry not found!');
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        let result: Uint8Array;
        if (entry.gsClass.endsWith(' class')) {
            const bytes: string = this.session.stringFromPerform(entry.oop, 'fileOutClass', [], 65525);
            result = str2ab(bytes);
        } else {
            result = str2ab('We do not yet support \'' + entry.gsClass + '\' instances!');
        } 
        return result;
    }

    writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): void {
        console.log('GemStoneFS.writeFile(' + uri.toString() + ')');

    }

    // --- manage files/folders

    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): void {
        console.log('GemStoneFS.rename(' + oldUri.toString() + ', ' + newUri.toString() + ')');
    }

    delete(uri: vscode.Uri): void {
        console.log('GemStoneFS.delete(' + uri.toString() + ')');
    }

    createDirectory(uri: vscode.Uri): void {
        console.log('GemStoneFS.createDirectory(' + uri.toString() + ')');
    }

    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    watch(_resource: vscode.Uri): vscode.Disposable {
        // ignore, fires for all changes...
        return new vscode.Disposable(() => { });
    }
}