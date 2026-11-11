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
