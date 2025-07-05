export interface Range {
    startLine: number;
    endLine: number;
}

export interface PLSQLNode {
    label: string;
    type: string;
    icon: string;
    children?: PLSQLNode[];
    parent?: PLSQLNode;
    range?: Range;
}

export interface ParserResult {
    nodes: PLSQLNode[];
    errors: string[];
}
