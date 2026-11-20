import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUseCaseEditPreview } from './buildUseCaseEditPreview.ts';

const blank = { kind: 'ADD_NODE', targetId: '', tempId: 'new:1', source: '', target: '',
  className: '', attributes: [], removeAttributes: [], methods: [], label: '결제', shape: 'useCaseNode',
  relationType: '', sourceMultiplicity: '', targetMultiplicity: '' };
const base = [
  { id: 'actor1', type: 'actorNode', position: { x: 10, y: 10 }, style: { width: 90, height: 100 }, data: { label: '회원' } },
  { id: 'uc1', type: 'useCaseNode', position: { x: 200, y: 10 }, style: { width: 150, height: 75 }, data: { label: '로그인' } },
];

test('new use-case appears only in preview and can be connected', () => {
  const preview = buildUseCaseEditPreview(base, [], [
    blank,
    { ...blank, kind: 'ADD_EDGE', tempId: '', source: 'actor1', target: 'new:1', relationType: 'association' },
  ]);
  assert.equal(base.length, 2);
  assert.equal(preview.nodes.length, 3);
  assert.equal(preview.edges.length, 1);
  assert.equal(preview.edges[0].target, preview.nodes[2].id);
  assert.equal(preview.edges[0].type, 'umlEdge');
});

test('updating an existing use-case preserves dimensions and position', () => {
  const preview = buildUseCaseEditPreview(base, [], [
    { ...blank, kind: 'UPDATE_NODE', targetId: 'uc1', shape: '', label: '결제 신청' },
  ]);
  assert.equal(base[1].data.label, '로그인');
  assert.equal(preview.nodes[1].data.label, '결제 신청');
  assert.deepEqual(preview.nodes[1].style, base[1].style);
  assert.deepEqual(preview.nodes[1].position, base[1].position);
});

test('boundary title is updated rather than label', () => {
  const boundary = { id: 'b', type: 'boundaryNode', position: { x: 0, y: 0 }, data: { title: '기존' }, style: { width: 300, height: 400 } };
  const preview = buildUseCaseEditPreview([boundary], [], [
    { ...blank, kind: 'UPDATE_NODE', targetId: 'b', shape: '', label: '새 경계' },
  ]);
  assert.equal(preview.nodes[0].data.title, '새 경계');
  assert.equal(preview.nodes[0].data.label, undefined);
});

test('deletion and invalid references are rejected', () => {
  assert.throws(() => buildUseCaseEditPreview(base, [], [{ ...blank, kind: 'DELETE_NODE' }]), /삭제/);
  assert.throws(() => buildUseCaseEditPreview(base, [], [
    { ...blank, kind: 'UPDATE_NODE', targetId: 'not-found', shape: '', label: '없는 노드' },
  ]), /존재하지/);
});

test('updating a relation does not modify original', () => {
  const edges = [{ id: 'e1', type: 'umlEdge', source: 'actor1', target: 'uc1', data: { relationType: 'association' } }];
  const preview = buildUseCaseEditPreview(base, edges, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'e1', relationType: 'include' },
  ]);
  assert.equal(edges[0].data.relationType, 'association');
  assert.equal(preview.edges[0].data.relationType, 'include');
});
