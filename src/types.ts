import * as vscode from 'vscode';

export interface PLSQLNode {
    label: string;
    type: string;
    icon?: string;
    children?: PLSQLNode[];
    range?: vscode.Range;
    parent?: PLSQLNode;
}

export interface ParserResult {
    nodes: PLSQLNode[];
    errors: string[];
}
