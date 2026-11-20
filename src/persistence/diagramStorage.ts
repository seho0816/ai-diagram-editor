import type { DiagramEdge, DiagramNode, DiagramType } from '../types/diagram';

const STORAGE_PREFIX = 'ai-diagram-editor:document:v1:';
export const MAX_DIAGRAM_FILE_SIZE = 5 * 1024 * 1024;
const DIAGRAM_TYPES: ReadonlyArray<DiagramType> = ['CLASS', 'FLOWCHART', 'USE_CASE'];

export type DiagramContents = {
    diagramType: DiagramType;
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    purpose: string;
};

export type DiagramDocument = DiagramContents & {
    version: 1;
    savedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isNode(value: unknown): value is DiagramNode {
    if (!isRecord(value) || !isRecord(value.position) || !isRecord(value.data)) return false;
    if (
        typeof value.id !== 'string' || !value.id.trim() ||
        typeof value.type !== 'string' || !value.type.trim() ||
        typeof value.position.x !== 'number' || !Number.isFinite(value.position.x) ||
        typeof value.position.y !== 'number' || !Number.isFinite(value.position.y)
    ) return false;

    if (value.type === 'classNode') {
        return typeof value.data.className === 'string' &&
            isStringArray(value.data.attributes) && isStringArray(value.data.methods);
    }
    if (value.type === 'flowchartNode') {
        return typeof value.data.label === 'string' && typeof value.data.shape === 'string';
    }
    // Preserve diagram-specific use-case nodes without rewriting their data.
    return true;
}

function isEdge(value: unknown): value is DiagramEdge {
    return isRecord(value) &&
        typeof value.id === 'string' && !!value.id.trim() &&
        typeof value.source === 'string' && !!value.source.trim() &&
        typeof value.target === 'string' && !!value.target.trim() &&
        (value.type === undefined || typeof value.type === 'string') &&
        (value.data === undefined || isRecord(value.data)) &&
        (value.sourceHandle == null || typeof value.sourceHandle === 'string') &&
        (value.targetHandle == null || typeof value.targetHandle === 'string');
}

export function parseDiagramDocument(raw: string): DiagramDocument {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('저장된 다이어그램 데이터가 올바른 JSON이 아닙니다.');
    }
    if (!isRecord(parsed) || parsed.version !== 1 ||
        !DIAGRAM_TYPES.includes(parsed.diagramType as DiagramType)) {
        throw new Error('지원하지 않는 다이어그램 저장 형식입니다.');
    }
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges) ||
        parsed.nodes.length > 1000 || parsed.edges.length > 3000 ||
        !parsed.nodes.every(isNode) || !parsed.edges.every(isEdge)) {
        throw new Error('저장된 노드 또는 관계선 데이터가 올바르지 않습니다.');
    }
    const nodeIds = new Set(parsed.nodes.map((node: DiagramNode) => node.id));
    const edgeIds = new Set(parsed.edges.map((edge: DiagramEdge) => edge.id));
    if (nodeIds.size !== parsed.nodes.length || edgeIds.size !== parsed.edges.length ||
        parsed.edges.some((edge: DiagramEdge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))) {
        throw new Error('중복 ID 또는 존재하지 않는 노드를 참조하는 관계선이 있습니다.');
    }
    return {
        version: 1,
        savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : '',
        diagramType: parsed.diagramType as DiagramType,
        purpose: typeof parsed.purpose === 'string' ? parsed.purpose : '',
        nodes: parsed.nodes.map((node: DiagramNode) => ({ ...node, selected: false, dragging: false })),
        // v1 class documents used 'umlEdge' before the use-case renderer was merged.
        // Normalize only CLASS documents, leaving use-case edges untouched.
        edges: parsed.edges.map((edge: DiagramEdge) => ({
            ...edge,
            type: parsed.diagramType === 'CLASS' && String(edge.type) === 'umlEdge'
                ? 'classUmlEdge'
                : edge.type,
            selected: false,
        } as DiagramEdge)),
    };
}

export function saveDiagramLocally(contents: DiagramContents): void {
    const document: DiagramDocument = {
        version: 1,
        savedAt: new Date().toISOString(),
        ...contents,
    };
    try {
        localStorage.setItem(STORAGE_PREFIX + document.diagramType, JSON.stringify(document));
    } catch {
        throw new Error('브라우저에 저장하지 못했습니다. 저장 공간이나 설정을 확인해 주세요.');
    }
}

export function loadDiagramLocally(diagramType: DiagramType): DiagramDocument | null {
    let raw: string | null;
    try {
        raw = localStorage.getItem(STORAGE_PREFIX + diagramType);
    } catch {
        throw new Error('브라우저 저장소를 읽지 못했습니다.');
    }
    if (raw === null) return null;
    const result = parseDiagramDocument(raw);
    if (result.diagramType !== diagramType) {
        throw new Error('저장된 다이어그램 종류가 현재 종류와 다릅니다.');
    }
    return result;
}

// JSON export uses the same v1 schema as browser saves.
export function serializeDiagramDocument(contents: DiagramContents): string {
    const documentData: DiagramDocument = {
        version: 1,
        savedAt: new Date().toISOString(),
        ...contents,
    };
    return JSON.stringify(documentData, null, 2);
}

export function exportDiagramJson(contents: DiagramContents): void {
    const json = serializeDiagramDocument(contents);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    if (blob.size > MAX_DIAGRAM_FILE_SIZE) {
        throw new Error('다이어그램이 5MB를 초과하여 JSON 파일로 내보낼 수 없습니다.');
    }
    const url = URL.createObjectURL(blob);
    try {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `diagram-${contents.diagramType.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    } finally {
        // Allow the browser time to start the download before releasing the URL.
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}
