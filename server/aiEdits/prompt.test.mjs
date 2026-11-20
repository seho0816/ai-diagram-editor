import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEditPrompt } from './prompt.mjs';

const common = {
  purpose: '고깃집 주문 시스템',
  nodes: [
    { id: 'order', type: 'useCaseNode', data: { label: '주문하기' } },
    { id: 'pay', type: 'useCaseNode', data: { label: '결제하기' } },
  ],
  edges: [
    { id: 'bs-e5', type: 'umlEdge', source: 'order', target: 'pay', data: { relationType: 'include' } },
  ],
  issue: {
    kind: 'IMPROVEMENT', title: '주문 관계 검토',
    reason: '결제 시점이 불명확합니다.', suggestion: '업무 규칙을 확인해 보세요.', targetId: 'bs-e5',
  },
};

test('use-case prompt permits grounded corrections but rejects ungrounded conversions', () => {
  const prompt = buildEditPrompt({ ...common, diagramType: 'USE_CASE' });
  assert.match(prompt, /유스케이스 두 개 사이를 단순 association으로 잇지 마세요/);
  assert.match(prompt, /기존 include\/extend의 종류 또는 방향을 변경하거나/);
  assert.match(prompt, /액터와 유스케이스 사이의 include/);
  assert.match(prompt, /evidence 필드/);
  assert.match(prompt, /방향/);
  assert.match(prompt, /operations=\[\]/);
  assert.match(prompt, /업무 규칙/);
});

test('class and flowchart prompts remain supported', () => {
  for (const type of ['CLASS', 'FLOWCHART']) {
    const prompt = buildEditPrompt({ ...common, diagramType: type });
    assert.match(prompt, /연산 종류/);
  }
});

test('a clarification answer is supplied only to the selected use-case proposal', () => {
  const answer = '결제는 주문 후 조건에 따라 나중에 진행할 수 있습니다.';
  const prompt = buildEditPrompt({ ...common, diagramType: 'USE_CASE', businessRule: answer });
  assert.match(prompt, /사용자가 추가로 답변한 업무 규칙/);
  assert.ok(prompt.includes(JSON.stringify(answer)));
  assert.match(prompt, /답변을 받았다면/);
  assert.match(prompt, /기존 관계를 유지하는 이유/);
});

test('use-case clarification supports narrowly scoped removal rather than invalid use-case association', () => {
  const prompt = buildEditPrompt({ ...common, diagramType: 'USE_CASE', businessRule: '주문은 먼저 끝내고 결제는 별도로 진행합니다.' });
  assert.match(prompt, /REMOVE_EDGE/);
  assert.match(prompt, /유스케이스 간 association으로 바꾸면 안 됩니다/);
  assert.match(prompt, /후불/);
});
