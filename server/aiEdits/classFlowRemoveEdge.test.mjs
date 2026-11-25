import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAiEditProposal } from './validateProposal.mjs';
import { buildEditPrompt, operationResponseSchema } from './prompt.mjs';

const blank = {
  kind: 'REMOVE_EDGE', targetId: 'e2', tempId: '', source: '', target: '',
  className: '', attributes: [], removeAttributes: [], methods: [],
  label: '', shape: '', relationType: '', evidence: '',
  sourceMultiplicity: '', targetMultiplicity: '',
};
const classNodes = [
  { id: 'orderItem', type: 'classNode', data: {} },
  { id: 'product', type: 'classNode', data: {} },
];
const classEdge = (id, relationType = 'association', source = 'orderItem', target = 'product') =>
  ({ id, type: 'classUmlEdge', source, target, data: { relationType } });
const flowEdge = (id, relationType = 'flow', source = 'a', target = 'b') =>
  ({ id, type: 'flowchartEdge', source, target, data: { relationType } });
const classContext = (edges, issue = null) => ({ diagramType: 'CLASS', nodes: classNodes, edges, issue });
const flowContext = (edges, issue = null) => ({
  diagramType: 'FLOWCHART', nodes: [
    { id: 'a', type: 'flowchartNode' }, { id: 'b', type: 'flowchartNode' },
  ], edges, issue,
});
const get = (operation, context) => normalizeAiEditProposal({ description: 'test', operations: [operation] }, context).operations;

test('class identical duplicate association can be removed', () => {
  const result = get(blank, classContext([classEdge('e1'), classEdge('e2')]));
  assert.equal(result.length, 1);
  assert.equal(result[0].targetId, 'e2');
});

test('explicit analysis target allows a unique incorrect class edge removal', () => {
  const issue = { targetId: 'e2', title: '관계선 제거', suggestion: '잘못된 관계선을 삭제해 주세요.' };
  assert.equal(get(blank, classContext([classEdge('e2')], issue)).length, 1);
});

test('unreferenced unique class edge is not removable', () => {
  assert.equal(get(blank, classContext([classEdge('e2')])).length, 0);
});

test('class composition reversed direction is not automatically duplicate', () => {
  assert.equal(get(blank, classContext([
    classEdge('e1', 'composition'), classEdge('e2', 'composition', 'product', 'orderItem'),
  ])).length, 0);
});

test('class association reverse direction is treated as duplicate', () => {
  assert.equal(get(blank, classContext([
    classEdge('e1'), classEdge('e2', 'association', 'product', 'orderItem'),
  ])).length, 1);
});

test('explicit analysis must refer to the edge, not a node', () => {
  const issue = { targetId: 'orderItem', title: '관계선 제거', suggestion: '이 관계를 삭제하세요' };
  assert.equal(get(blank, classContext([classEdge('e2')], issue)).length, 0);
});

test('flowchart exact duplicate can be removed', () => {
  assert.equal(get(blank, flowContext([flowEdge('e1'), flowEdge('e2')])).length, 1);
});

test('flowchart yes and no decisions are not duplicate', () => {
  assert.equal(get(blank, flowContext([flowEdge('e1', 'yes'), flowEdge('e2', 'no')])).length, 0);
});

test('flowchart unique edge may be removed only when issue targets it explicitly', () => {
  const issue = { targetId: 'e2', title: '불필요한 선', suggestion: '해당 관계선을 제거해야 합니다.' };
  assert.equal(get(blank, flowContext([flowEdge('e2', 'yes')], issue)).length, 1);
  assert.equal(get(blank, flowContext([flowEdge('e2', 'yes')], { ...issue, targetId: 'e1' })).length, 0);
});

test('unknown IDs, wrong types and extra rewiring are rejected', () => {
  assert.equal(get({ ...blank, targetId: 'missing' }, classContext([classEdge('e2')])).length, 0);
  assert.equal(get(blank, classContext([flowEdge('e2')])).length, 0);
  assert.equal(get({ ...blank, source: 'a' }, classContext([classEdge('e1'), classEdge('e2')])).length, 0);
});

test('two edge removals in a single proposal are rejected as a whole', () => {
  const edges = [classEdge('e1'), classEdge('e2'), classEdge('e3')];
  const result = normalizeAiEditProposal({ operations: [
    { ...blank, targetId: 'e1' }, { ...blank, targetId: 'e2' },
  ] }, classContext(edges));
  assert.deepEqual(result.operations, []);
});

test('node removal remains unsupported', () => {
  assert.equal(get({ ...blank, kind: 'REMOVE_NODE', targetId: 'orderItem' }, classContext([])).length, 0);
});

test('use-case business-rule removal behavior remains available', () => {
  const result = get({ ...blank, targetId: 'uc-e', evidence: '별도 결제' }, {
    diagramType: 'USE_CASE', purpose: '주문 시스템', businessRule: '별도 결제',
    nodes: [{ id: 'uc1', type: 'useCaseNode' }, { id: 'uc2', type: 'useCaseNode' }],
    edges: [{ id: 'uc-e', type: 'umlEdge', source: 'uc1', target: 'uc2', data: { relationType: 'include' } }],
  });
  assert.equal(result.length, 1);
});

test('prompt offers constrained class/flowchart edge removal without node deletion', () => {
  const makePrompt = (diagramType) => buildEditPrompt({
    diagramType, purpose: '쇼핑몰', businessRule: '', nodes: classNodes,
    edges: [classEdge('e1'), classEdge('e2')],
    issue: { targetId: 'e2', title: '중복 관계선', reason: '두 번 연결됨', suggestion: '한 선을 제거하세요' },
  });
  assert.match(makePrompt('CLASS'), /CLASS\/FLOWCHART에서는/);
  assert.match(makePrompt('FLOWCHART'), /중복/);
  assert.match(makePrompt('CLASS'), /노드 삭제는 금지/);
  assert.ok(operationResponseSchema.properties.operations.items.properties.kind.enum.includes('REMOVE_EDGE'));
});
