import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CLASS_EXAMPLES, createClassExample } from './classExamples.ts';

const ids = ['bbq', 'department', 'convenience', 'library'];

test('사례 4개가 정의되어 있고 설명과 설계 목적을 갖는다', () => {
  assert.deepEqual(CLASS_EXAMPLES.map((item) => item.id), ids);
  for (const info of CLASS_EXAMPLES) {
    assert.ok(info.title.length > 2);
    assert.ok(info.purpose.length > 8);
  }
});

for (const id of ids) {
  test(`${id}: 노드와 관계선 참조가 유효하며 도형이 겹치지 않는다`, () => {
    const graph = createClassExample(id, 'classUmlEdge');
    const nodeIds = graph.nodes.map((node) => node.id);
    const edgeIds = graph.edges.map((edge) => edge.id);
    assert.ok(nodeIds.length >= 6);
    assert.ok(graph.edges.length >= 5);
    assert.equal(new Set(nodeIds).size, nodeIds.length);
    assert.equal(new Set(edgeIds).size, edgeIds.length);
    const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
    for (const node of graph.nodes) {
      assert.equal(node.type, 'classNode');
      assert.ok(node.data.className);
      assert.ok(Array.isArray(node.data.attributes));
      assert.ok(Array.isArray(node.data.methods));
      for (const other of graph.nodes) {
        if (node === other) continue;
        // Class node minimum width 200; specimens spaced by more than 210 horizontally
        // unless their vertical ranges do not overlap.
        assert.ok(Math.abs(node.position.x - other.position.x) >= 200
          || Math.abs(node.position.y - other.position.y) >= 190,
        `겹친 클래스: ${node.data.className}/${other.data.className}`);
      }
    }
    for (const edge of graph.edges) {
      assert.equal(edge.type, 'classUmlEdge');
      assert.ok(nodes.has(edge.source));
      assert.ok(nodes.has(edge.target));
      assert.ok(['top','right','bottom','left'].includes(edge.sourceHandle));
      assert.ok(['top','right','bottom','left'].includes(edge.targetHandle));
      assert.ok(['association','generalization','aggregation','composition','dependency'].includes(edge.data.relationType));
    }
  });
}

test('같은 사례를 다시 생성해도 참조 데이터가 공유되지 않는다', () => {
  const first = createClassExample('bbq');
  const second = createClassExample('bbq');
  first.nodes[0].position.x += 500;
  first.nodes[0].data.attributes.push('mutable');
  assert.notDeepEqual(first.nodes[0], second.nodes[0]);
});

test('알 수 없는 사례 요청은 명확한 오류', () => {
  assert.throws(() => createClassExample('nonsense'), /알 수 없는 클래스 예시/);
});
