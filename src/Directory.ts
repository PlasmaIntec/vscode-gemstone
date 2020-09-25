
import * as vscode from 'vscode';
import { File } from './File';
import { Session } from './Session';

export class Directory implements vscode.FileStat {

    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;

    name: string;
    entries: Map<string, File | Directory> | null;
    session: Session;
    oop: number | null;
    isClass: boolean;

    constructor(session: Session, name: string, data: any = null, isClass: boolean = false) {
        this.type = vscode.FileType.Directory;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = data.size || 0;
        this.name = name;
        this.entries = null;
        this.session = session;
        this.oop = data.oop || 1;
        this.isClass = isClass;
    }

    addEntry(key: string, value: Directory | File) {
        if (!this.entries) {
            this.entries = new Map();
        }
        this.entries.set(key, value);
    }

    getChildren(uri: vscode.Uri): [string, vscode.FileType][] {
        let result: [string, vscode.FileType][] = [];
        if (this.entries) {
            for (const [name, child] of this.entries) {
                result.push([name, child.type]);
            }
        }
        return result;
    }
}
