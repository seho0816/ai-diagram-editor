import test from 'node:test';
import assert from 'node:assert/strict';
import { saveDiagramLocally, loadDiagramLocally, parseDiagramDocument, serializeDiagramDocument, MAX_DIAGRAM_FILE_SIZE } from '../src/persistence/diagramStorage.ts';

function storageMock() {
    const entries = new Map();
    globalThis.localStorage = {
        getItem(key) { return entries.get(key) ?? null; },
        setItem(key, value) { entries.set(key, value); },
    };
    return entries;
}
const nodes = [
    { id: 'a', type: 'classNode', position: { x: 10, y: 22 }, data: { className: 'User', attributes: [], methods: [] } },
    { id: 'b', type: 'classNode', position: { x: 210, y: 22 }, data: { className: 'Order', attributes: ['+ id: Long'], methods: [] } },
];
const edges = [{ id: 'e1', source: 'a', target: 'b', type: 'umlEdge', data: { relationType: 'composition' } }];
const document = { diagramType: 'CLASS', nodes, edges, purpose: '주문 관리' };

test('save then load preserves class data and relation kind', () => {
    storageMock();
    saveDiagramLocally(document);
    const saved = loadDiagramLocally('CLASS');
    assert.equal(saved.nodes[0].position.y, 22);
    assert.equal(saved.edges[0].data.relationType, 'composition');
    assert.equal(saved.purpose, '주문 관리');
});

test('diagram types have distinct storage keys', () => {
    storageMock();
    saveDiagramLocally(document);
    saveDiagramLocally({ diagramType: 'FLOWCHART', nodes: [], edges: [], purpose: '램프 수리' });
    saveDiagramLocally({ diagramType: 'USE_CASE', nodes: [{ id: 'actor', type: 'actorNode', position: { x: 5, y: 10 }, data: { label: '회원' } }], edges: [], purpose: '시스템' });
    assert.equal(loadDiagramLocally('CLASS').nodes.length, 2);
    assert.equal(loadDiagramLocally('FLOWCHART').purpose, '램프 수리');
    assert.equal(loadDiagramLocally('USE_CASE').nodes[0].type, 'actorNode');
});

test('loading nonexistent save returns null', () => {
    storageMock();
    assert.equal(loadDiagramLocally('CLASS'), null);
});

test('reject broken JSON and unsupported version', () => {
    assert.throws(() => parseDiagramDocument('{oops'), /JSON/);
    assert.throws(() => parseDiagramDocument('{"version":3}'), /지원하지 않는/);
});

test('reject missing target and duplicate node ids', () => {
    const broken = { version: 1, ...document, edges: [{ ...edges[0], target: 'missing' }] };
    assert.throws(() => parseDiagramDocument(JSON.stringify(broken)), /존재하지 않는/);
    broken.edges = [];
    broken.nodes = [nodes[0], nodes[0]];
    assert.throws(() => parseDiagramDocument(JSON.stringify(broken)), /중복 ID/);
});

test('clears old selection flags when loading', () => {
    const raw = { version: 1, ...document, nodes: [{ ...nodes[0], selected: true, dragging: true }, nodes[1]], edges: [{ ...edges[0], selected: true }] };
    const parsed = parseDiagramDocument(JSON.stringify(raw));
    assert.equal(parsed.nodes[0].selected, false);
    assert.equal(parsed.nodes[0].dragging, false);
    assert.equal(parsed.edges[0].selected, false);
});


test('JSON export round trip preserves class relation types, positions and purpose', () => {
    const exported = serializeDiagramDocument(document);
    const restored = parseDiagramDocument(exported);
    assert.equal(restored.version, 1);
    assert.equal(restored.diagramType, 'CLASS');
    assert.equal(restored.nodes[1].position.x, 210);
    assert.equal(restored.edges[0].data.relationType, 'composition');
    assert.equal(restored.purpose, '주문 관리');
});

test('JSON round trip preserves use-case diagram type and custom node data', () => {
    const original = {
        diagramType: 'USE_CASE',
        nodes: [{ id: 'uc1', type: 'actorNode', position: { x: 30, y: 20 }, data: { label: '회원', customField: 'hello' } }],
        edges: [],
        purpose: '고객 시스템',
    };
    const restored = parseDiagramDocument(serializeDiagramDocument(original));
    assert.equal(restored.nodes[0].type, 'actorNode');
    assert.equal(restored.nodes[0].data.customField, 'hello');
    assert.equal(restored.diagramType, 'USE_CASE');
});

test('file size limit is 5MiB', () => {
    assert.equal(MAX_DIAGRAM_FILE_SIZE, 5 * 1024 * 1024);
});

test('legacy class umlEdge loads as classUmlEdge without changing usecase edges', () => {
    const legacy = parseDiagramDocument(JSON.stringify({ version: 1, ...document }));
    assert.equal(legacy.edges[0].type, 'classUmlEdge');
    assert.equal(legacy.edges[0].data.relationType, 'composition');
    const usecase = parseDiagramDocument(JSON.stringify({
      version: 1, diagramType: 'USE_CASE', purpose: '예약',
      nodes: [
        { id: 'a', type: 'actorNode', position: { x: 0, y: 0 }, data: { label: '고객' } },
        { id: 'u', type: 'useCaseNode', position: { x: 80, y: 0 }, data: { label: '예약' } },
      ],
      edges: [{ id: 'r', type: 'umlEdge', source: 'a', target: 'u', data: { relationType: 'include' } }],
    }));
    assert.equal(usecase.edges[0].type, 'umlEdge');
    assert.equal(usecase.edges[0].data.relationType, 'include');
});
