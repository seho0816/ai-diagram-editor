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

test('use-case label update and actor association are accepted', () => {
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
    { ...blank, kind: 'UPDATE_EDGE', targetId: 'e1', relationType: 'association' },
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

const usecaseRelations = {
  diagramType: 'USE_CASE',
  nodes: [
    { id: 'actor', type: 'actorNode', data: { label: '손님' } },
    { id: 'order', type: 'useCaseNode', data: { label: '주문하기' } },
    { id: 'pay', type: 'useCaseNode', data: { label: '결제하기' } },
  ],
  edges: [
    { id: 'bs-e5', type: 'umlEdge', source: 'order', target: 'pay', data: { relationType: 'include' } },
    { id: 'actor-order', type: 'umlEdge', source: 'actor', target: 'order', data: { relationType: 'association' } },
  ],
};

test('AI cannot turn use-case include into association (reported regression)', () => {
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'association' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, usecaseRelations).operations.length, 0);
});

test('AI does not flip existing include into extend without explicit business rules', () => {
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, usecaseRelations).operations.length, 0);
});

test('AI cannot add association between two use cases', () => {
  const op = { ...blank, kind: 'ADD_EDGE', source: 'order', target: 'pay', relationType: 'association' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, usecaseRelations).operations.length, 0);
});

test('AI can still connect actor and use case by association', () => {
  const op = { ...blank, kind: 'ADD_EDGE', source: 'actor', target: 'order', relationType: 'association' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, { ...usecaseRelations, edges: [] }).operations.length, 1);
});

test('AI can still add include between two use cases when no inclusion exists', () => {
  const op = { ...blank, kind: 'ADD_EDGE', source: 'order', target: 'pay', relationType: 'include' };
  const ctx = { ...usecaseRelations, edges: [] };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, ctx).operations.length, 1);
});

test('AI cannot propose include between an actor and a use case', () => {
  const op = { ...blank, kind: 'ADD_EDGE', source: 'actor', target: 'order', relationType: 'include' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, usecaseRelations).operations.length, 0);
});

test('AI can still change a use-case/use-case association to include', () => {
  const ctx = { ...usecaseRelations, edges: [
    { id: 'legacy', type: 'umlEdge', source: 'order', target: 'pay', data: { relationType: 'association' } },
  ] };
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'legacy', relationType: 'include', evidence: '주문 시 결제를 반드시 진행한다' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, { ...ctx, purpose: '주문 시 결제를 반드시 진행한다' }).operations.length, 1);
});

test('an unsafe use-case edge change cancels the entire AI proposal, even with other valid operations', () => {
  const safe = { ...blank, kind: 'UPDATE_NODE', targetId: 'order', label: '주문 접수', shape: '' };
  const unsafe = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'association' };
  const result = normalizeAiEditProposal({ description: '관계선과 이름을 변경', operations: [safe, unsafe] }, usecaseRelations);
  assert.equal(result.operations.length, 0);
  assert.match(result.description, /적합하지 않은|수동으로 확인|업무 규칙/);
});

test('AI cannot bypass protected include by adding a parallel extend edge', () => {
  const op = { ...blank, kind: 'ADD_EDGE', source: 'order', target: 'pay', relationType: 'extend' };
  const result = normalizeAiEditProposal({ operations: [op] }, usecaseRelations);
  assert.equal(result.operations.length, 0);
  assert.match(result.description, /이미 연결된|이미 include\/extend/);
});


test('AI corrects structurally invalid actor-to-usecase include to association without policy evidence', () => {
  const diagram = { ...usecaseRelations, edges: [
    { id: 'wrong', type: 'umlEdge', source: 'actor', target: 'order', data: { relationType: 'include' } },
  ] };
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'wrong', relationType: 'association' };
  const result = normalizeAiEditProposal({ operations: [op] }, diagram);
  assert.equal(result.operations.length, 1);
});

test('explicit user-authored rule allows include to extend with reversed endpoints', () => {
  const purpose = '결제는 주문 후 조건에 따라 나중에 진행될 수 있다.';
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
    source: 'pay', target: 'order', evidence: '결제는 주문 후 조건에 따라 나중에 진행될 수 있다.' };
  const result = normalizeAiEditProposal({ operations: [op] }, { ...usecaseRelations, purpose });
  assert.equal(result.operations.length, 1);
  assert.equal(result.operations[0].source, 'pay');
});

test('model cannot invent business rule quote or use its own issue rationale as evidence', () => {
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
    source: 'pay', target: 'order', evidence: '결제는 주문 후 조건에 따라 나중에 진행될 수 있다.' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, { ...usecaseRelations, purpose: '고깃집 주문 시스템' }).operations.length, 0);
  assert.equal(normalizeAiEditProposal({ operations: [op] }, { ...usecaseRelations, purpose: '주문과 결제 관계' }).operations.length, 0);
});

test('AI cannot rewire relation to unrelated usecase', () => {
  const diagram = { ...usecaseRelations, nodes: [...usecaseRelations.nodes, { id: 'extra', type: 'useCaseNode' }] };
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'include',
    source: 'extra', target: 'pay', evidence: '결제는 반드시 진행한다' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, { ...diagram, purpose: '결제는 반드시 진행한다' }).operations.length, 0);
});

test('explicit note content may support grounded relationship edit', () => {
  const diagram = { ...usecaseRelations, nodes: [
    ...usecaseRelations.nodes,
    { id: 'note1', type: 'note', data: { label: '결제는 항상 선택 사항이다.' } },
  ] };
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
    evidence: '결제는 항상 선택 사항이다.' };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, diagram).operations.length, 1);
});

test('a one-issue answer can justify a use-case relation correction without changing the global purpose', () => {
  const businessRule = '결제는 주문 후 조건에 따라 나중에 진행될 수 있다.';
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
    source: 'pay', target: 'order', evidence: businessRule };
  const result = normalizeAiEditProposal({ operations: [op] }, {
    ...usecaseRelations, purpose: '고깃집 주문 시스템', businessRule,
  });
  assert.equal(result.operations.length, 1);
  assert.equal(result.operations[0].source, 'pay');
});

test('a clarification does not authorize an invented rule absent from the answer', () => {
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend',
    source: 'pay', target: 'order', evidence: '결제는 반드시 현금으로 선불한다' };
  const result = normalizeAiEditProposal({ operations: [op] }, {
    ...usecaseRelations, purpose: '고깃집 주문 시스템', businessRule: '결제는 주문 후 별도 진행한다.',
  });
  assert.equal(result.operations.length, 0);
});

test('short free-text rule is accepted as evidence without a minimum character count', () => {
  const answer = '후불';
  const op = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'include', evidence: answer };
  const result = normalizeAiEditProposal({ operations: [op] }, { ...usecaseRelations, businessRule: answer });
  assert.equal(result.operations.length, 1);
});

test('separate payment after ordering can remove an include, without replacing it with association', () => {
  const answer = '주문은 먼저 완료하고 결제는 식사 후 별도 진행';
  const op = { ...blank, kind: 'REMOVE_EDGE', targetId: 'bs-e5', evidence: answer };
  const result = normalizeAiEditProposal({ operations: [op] }, { ...usecaseRelations, businessRule: answer });
  assert.equal(result.operations.length, 1);
  assert.equal(result.operations[0].kind, 'REMOVE_EDGE');
});

test('prepayment timing alone cannot authorize deletion or conditional extend', () => {
  const answer = '선불제가 아님ㅇㅇ';
  const removal = { ...blank, kind: 'REMOVE_EDGE', targetId: 'bs-e5', evidence: answer };
  const change = { ...blank, kind: 'UPDATE_EDGE', targetId: 'bs-e5', relationType: 'extend', evidence: answer };
  const ctx = { ...usecaseRelations, businessRule: answer };
  assert.equal(normalizeAiEditProposal({ operations: [removal] }, ctx).operations.length, 0);
  assert.equal(normalizeAiEditProposal({ operations: [change] }, ctx).operations.length, 0);
});

test('AI cannot remove an actor association or a class relationship', () => {
  const answer = '주문과 결제는 별도 업무';
  const op = { ...blank, kind: 'REMOVE_EDGE', targetId: 'actor-order', evidence: answer };
  assert.equal(normalizeAiEditProposal({ operations: [op] }, { ...usecaseRelations, businessRule: answer }).operations.length, 0);
  assert.equal(normalizeAiEditProposal({ operations: [op] }, { ...ctx, businessRule: answer }).operations.length, 0);
});

test('very short but explicit separate-payment answer can propose a removal', () => {
  const answer = '별도 결제';
  const op = { ...blank, kind: 'REMOVE_EDGE', targetId: 'bs-e5', evidence: answer };
  const result = normalizeAiEditProposal({ operations: [op] }, { ...usecaseRelations, businessRule: answer });
  assert.equal(result.operations.length, 1);
});
