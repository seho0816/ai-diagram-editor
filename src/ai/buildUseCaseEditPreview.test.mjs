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
  const nodes = [...base, { id: 'uc2', type: 'useCaseNode', position: { x: 400, y: 10 }, data: { label: '결제' } }];
  const edges = [{ id: 'e1', type: 'umlEdge', source: 'uc1', target: 'uc2', data: { relationType: 'association' } }];
  const preview = buildUseCaseEditPreview(nodes, edges, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'e1', relationType: 'include', evidence: '결제는 항상 필수 과정이다' },
  ], '결제는 항상 필수 과정이다');
  assert.equal(edges[0].data.relationType, 'association');
  assert.equal(preview.edges[0].data.relationType, 'include');
});

const usecaseNodes = [...base, { id: 'uc2', type: 'useCaseNode', position: { x: 400, y: 10 }, data: { label: '결제' } }];
const includeEdges = [
  { id: 'bs-e5', type: 'umlEdge', source: 'uc1', target: 'uc2', data: { relationType: 'include' } },
];

test('preview refuses include to association change while keeping original immutable', () => {
  assert.throws(() => buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'association' },
  ]), /관계선|수동/);
  assert.equal(includeEdges[0].data.relationType, 'include');
});

test('preview refuses include to extend conversion', () => {
  assert.throws(() => buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend' },
  ]), /업무 규칙/);
});

test('preview refuses newly proposed usecase-to-usecase association', () => {
  assert.throws(() => buildUseCaseEditPreview(usecaseNodes, [], [
    { ...blank, kind: 'ADD_EDGE', source: 'uc1', target: 'uc2', relationType: 'association' },
  ]), /UML 의미/);
});

test('preview still accepts association between actor and use case', () => {
  const preview = buildUseCaseEditPreview(base, [], [
    { ...blank, kind: 'ADD_EDGE', source: 'actor1', target: 'uc1', relationType: 'association' },
  ]);
  assert.equal(preview.edges.length, 1);
  assert.equal(preview.edges[0].data.relationType, 'association');
});

test('preview cannot bypass protected include by adding a parallel extend edge', () => {
  assert.throws(() => buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'ADD_EDGE', source: 'uc1', target: 'uc2', relationType: 'extend' },
  ]), /이미 연결된/);
});


test('obvious actor include mistake can be previewed as association without business-rule quote', () => {
  const edges = [{ id: 'wrong', type: 'umlEdge', source: 'actor1', target: 'uc1',
    data: { relationType: 'include' } }];
  const preview = buildUseCaseEditPreview(base, edges, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'wrong', relationType: 'association' },
  ]);
  assert.equal(edges[0].data.relationType, 'include');
  assert.equal(preview.edges[0].data.relationType, 'association');
});

test('explicit rule lets AI change include to extend and reverse direction in isolated preview', () => {
  const purpose = '결제는 주문 후 조건에 따라 나중에 진행될 수 있다.';
  const before = [{ ...includeEdges[0], sourceHandle: 'bottom', targetHandle: 'top' }];
  const preview = buildUseCaseEditPreview(usecaseNodes, before, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
      source: 'uc2', target: 'uc1', evidence: purpose },
  ], purpose);
  assert.equal(before[0].source, 'uc1');
  assert.equal(before[0].data.relationType, 'include');
  assert.equal(preview.edges[0].source, 'uc2');
  assert.equal(preview.edges[0].target, 'uc1');
  assert.equal(preview.edges[0].sourceHandle, 'top');
  assert.equal(preview.edges[0].targetHandle, 'bottom');
  assert.equal(preview.edges[0].data.relationType, 'extend');
  assert.match(preview.changes.join(' '), /방향 반전/);
});

test('quote fabricated from AI issue is insufficient on client preview', () => {
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
    evidence: '결제는 항상 선택 사항이다' };
  assert.throws(() => buildUseCaseEditPreview(usecaseNodes, includeEdges, [op], '고깃집 주문 시스템'), /업무 규칙/);
});

test('cannot silently rewire relationship to another use-case', () => {
  assert.throws(() => buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'include',
      source: 'actor1', target: 'uc2' },
  ]), /기존 양 끝점/);
});

test('clarifying answer permits safe preview without rewriting diagram purpose', () => {
  const businessRule = '결제는 주문 후 조건에 따라 나중에 진행될 수 있다.';
  const preview = buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
      source: 'uc2', target: 'uc1', evidence: businessRule },
  ], '고깃집 주문 시스템', businessRule);
  assert.equal(preview.edges[0].data.relationType, 'extend');
  assert.equal(preview.edges[0].source, 'uc2');
  assert.equal(includeEdges[0].data.relationType, 'include');
});

test('preview rejects a different business rule than the answer submitted', () => {
  assert.throws(() => buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
      evidence: '결제는 반드시 먼저 진행해야 한다.' },
  ], '고깃집 주문 시스템', '결제는 주문 후 별도 진행한다.'), /업무 규칙/);
});

test('independent payment removal changes only draft graph until approval', () => {
  const answer = '주문은 먼저 완료하고 결제는 식사 후 별도 진행';
  const preview = buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'REMOVE_EDGE', targetId: 'bs-e5', evidence: answer },
  ], '고깃집 주문 시스템', answer);
  assert.equal(includeEdges.length, 1);
  assert.equal(preview.edges.length, 0);
  assert.match(preview.changes[0], /관계선 제거/);
});

test('short prepayment statement is not enough to delete a use-case relation', () => {
  const answer = '선불제가 아님ㅇㅇ';
  assert.throws(() => buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'REMOVE_EDGE', targetId: 'bs-e5', evidence: answer },
  ], '고깃집 주문 시스템', answer), /독립적인 업무/);
});

test('a short explicit business rule creates a real edge-removal preview', () => {
  const answer = '별도 결제';
  const preview = buildUseCaseEditPreview(usecaseNodes, includeEdges, [
    { ...blank, kind: 'REMOVE_EDGE', targetId: 'bs-e5', evidence: answer },
  ], '고깃집 주문 시스템', answer);
  assert.equal(preview.edges.length, 0);
  assert.equal(includeEdges.length, 1);
});
