import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPreviewDiff } from './buildPreviewDiff.ts';

const node = (id, data = { label: id }) => ({ id, type: 'flowchartNode', position: { x: 0, y: 0 }, data });
const edge = (id, relationType = 'include') => ({
  id, type: 'umlEdge', source: 'a', target: 'b', data: { relationType },
});

test('변경이 없으면 강조와 집계가 없다', () => {
  const beforeNodes = [node('a'), node('b')];
  const beforeEdges = [edge('x')];
  const afterNodes = structuredClone(beforeNodes).map((item) => ({ ...item, selected: true, dragging: true }));
  const diff = buildPreviewDiff(beforeNodes, beforeEdges, afterNodes, structuredClone(beforeEdges));
  assert.deepEqual(diff.nodeCount, { added: 0, changed: 0, removed: 0 });
  assert.deepEqual(diff.edgeCount, { added: 0, changed: 0, removed: 0 });
  assert.ok(!diff.nodes[0].className);
});

test('새 노드와 새 관계선은 초록색 className을 받는다', () => {
  const diff = buildPreviewDiff([node('a')], [], [node('a'), node('b')], [edge('x')]);
  assert.equal(diff.nodeCount.added, 1);
  assert.equal(diff.edgeCount.added, 1);
  assert.match(diff.nodes[1].className, /ai-diff-added/);
  assert.match(diff.edges[0].className, /ai-diff-added/);
});

test('내용 변경과 관계선 종류 변경은 각각 파란색으로 강조한다', () => {
  const diff = buildPreviewDiff([node('a')], [edge('x')], [node('a', { label: '다른 이름' })], [edge('x', 'extend')]);
  assert.equal(diff.nodeCount.changed, 1);
  assert.equal(diff.edgeCount.changed, 1);
  assert.match(diff.nodes[0].className, /ai-diff-changed/);
  assert.match(diff.edges[0].className, /ai-diff-changed/);
});

test('삭제 관계선은 원본 자리에 빨간 잔상으로 남고 실제 수정안은 변경하지 않는다', () => {
  const beforeNodes = [node('a'), node('b')];
  const beforeEdges = [edge('bs-e5')];
  const afterEdges = [];
  const diff = buildPreviewDiff(beforeNodes, beforeEdges, beforeNodes, afterEdges);
  assert.equal(diff.edgeCount.removed, 1);
  assert.equal(diff.edges.length, 1);
  assert.equal(diff.edges[0].id, 'bs-e5');
  assert.equal(diff.edges[0].data.relationType, 'include');
  assert.match(diff.edges[0].className, /ai-diff-removed/);
  assert.equal(afterEdges.length, 0);
  assert.equal(beforeEdges[0].className, undefined);
});

test('삭제 노드와 연결선도 원본 위치에 잔상을 남긴다', () => {
  const before = [node('a'), node('b')];
  const diff = buildPreviewDiff(before, [edge('x')], [node('a')], []);
  assert.equal(diff.nodeCount.removed, 1);
  assert.equal(diff.edgeCount.removed, 1);
  assert.equal(diff.nodes.at(-1).id, 'b');
  assert.match(diff.nodes.at(-1).className, /ai-diff-removed/);
});

test('기존 className과 노드 위치 등 원본 데이터는 유지된다', () => {
  const before = [node('a')];
  const after = [{ ...node('a', { label: '수정' }), className: 'custom' }];
  const diff = buildPreviewDiff(before, [], after, []);
  assert.equal(diff.nodes[0].className, 'custom ai-diff-changed');
  assert.deepEqual(after[0].position, { x: 0, y: 0 });
  assert.equal(after[0].className, 'custom');
});
