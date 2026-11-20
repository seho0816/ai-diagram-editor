import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAiEditProposal } from './validateProposal.mjs';

const blank = {
  kind: 'ADD_NODE', targetId: '', tempId: 'new:1', source: '', target: '',
  className: 'Payment', attributes: [], removeAttributes: [], methods: [], label: '', shape: '',
  relationType: '', sourceMultiplicity: '', targetMultiplicity: '',
};
const ctx = {
  diagramType: 'CLASS',
  nodes: [{ id: 'user', type: 'classNode' }],
  edges: [{ id: 'edge', type: 'umlEdge' }],
};

test('valid class node + edge with alias', () => {
  const raw = { description: '새 결제 클래스 연결', operations: [
    blank,
    { ...blank, kind: 'ADD_EDGE', tempId: '', source: 'user', target: 'new:1', relationType: 'association' },
  ] };
  assert.equal(normalizeAiEditProposal(raw, ctx).operations.length, 2);
});

test('untrusted node reference is rejected', () => {
  const raw = { description: 'bad', operations: [
    { ...blank, kind: 'UPDATE_NODE', targetId: 'missing' },
    { ...blank, kind: 'ADD_EDGE', tempId: '', source: 'user', target: 'missing', relationType: 'association' },
  ] };
  assert.equal(normalizeAiEditProposal(raw, ctx).operations.length, 0);
});

test('flowchart cannot inject a class operation', () => {
  const flow = { ...ctx, diagramType: 'FLOWCHART' };
  assert.equal(normalizeAiEditProposal({ operations: [blank] }, flow).operations.length, 0);
});

test('delete operations are ignored', () => {
  assert.equal(normalizeAiEditProposal({ operations: [{ ...blank, kind: 'DELETE_NODE' }] }, ctx).operations.length, 0);
});


test('class attribute removal of an existing attribute is accepted', () => {
  const diagram = {
    diagramType: 'CLASS',
    nodes: [{ id: 'order', type: 'classNode', data: { attributes: ['- orderId: Long', '- userId: Long'] } }],
    edges: [],
  };
  const raw = { operations: [{ ...blank, kind: 'UPDATE_NODE', targetId: 'order', className: 'Order', removeAttributes: ['- userId: Long'] }] };
  const ops = normalizeAiEditProposal(raw, diagram).operations;
  assert.equal(ops.length, 1);
  assert.deepEqual(ops[0].removeAttributes, ['- userId: Long']);
});

test('removal of nonexistent attribute is rejected', () => {
  const diagram = { diagramType: 'CLASS', nodes: [{ id: 'order', type: 'classNode', data: { attributes: ['- orderId: Long'] } }], edges: [] };
  const raw = { operations: [{ ...blank, kind: 'UPDATE_NODE', targetId: 'order', className: 'Order', removeAttributes: ['- notHere: Long'] }] };
  assert.equal(normalizeAiEditProposal(raw, diagram).operations.length, 0);
});

test('class attribute removal cannot be sent via edge update', () => {
  const raw = { operations: [{ ...blank, kind: 'UPDATE_EDGE', targetId: 'edge', relationType: 'association', removeAttributes: ['- anything: Long'] }] };
  assert.equal(normalizeAiEditProposal(raw, ctx).operations.length, 0);
});

test('use-case actor label update and include edge are accepted', () => {
  const usecase = {
    diagramType: 'USE_CASE',
    nodes: [
      { id: 'actor1', type: 'actorNode', data: { label: '회원' } },
      { id: 'uc1', type: 'useCaseNode', data: { label: '주문' } },
    ],
    edges: [{ id: 'e1', type: 'umlEdge', source: 'actor1', target: 'uc1' }],
  };
  const ops = [
    { ...blank, kind: 'UPDATE_NODE', targetId: 'uc1', label: '주문 요청', shape: '' },
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'e1', relationType: 'include' },
  ];
  assert.equal(normalizeAiEditProposal({ operations: ops }, usecase).operations.length, 2);
});

test('use-case new actor and new use-case can be linked by alias', () => {
  const usecase = { diagramType: 'USE_CASE', nodes: [], edges: [] };
  const ops = [
    { ...blank, kind: 'ADD_NODE', tempId: 'new:actor', shape: 'actorNode', label: '고객' },
    { ...blank, kind: 'ADD_NODE', tempId: 'new:uc', shape: 'useCaseNode', label: '로그인' },
    { ...blank, kind: 'ADD_EDGE', tempId: '', source: 'new:actor', target: 'new:uc', relationType: 'association' },
  ];
  assert.equal(normalizeAiEditProposal({ operations: ops }, usecase).operations.length, 3);
});

test('use-case never adds an edge to boundary without handles', () => {
  const usecase = { diagramType: 'USE_CASE', nodes: [
    { id: 'b', type: 'boundaryNode' }, { id: 'a', type: 'actorNode' },
  ], edges: [] };
  const ops = [{ ...blank, kind: 'ADD_EDGE', source: 'a', target: 'b', relationType: 'association' }];
  assert.equal(normalizeAiEditProposal({ operations: ops }, usecase).operations.length, 0);
});

test('class proposals now target classUmlEdge while use-case keeps umlEdge', () => {
  const classContext = { ...ctx, edges: [{ id: 'e', type: 'classUmlEdge' }] };
  const operation = { ...blank, kind: 'UPDATE_EDGE', targetId: 'e', relationType: 'composition' };
  assert.equal(normalizeAiEditProposal({ operations: [operation] }, classContext).operations.length, 1);
  assert.equal(normalizeAiEditProposal({ operations: [operation] }, ctx).operations.length, 0);
});
