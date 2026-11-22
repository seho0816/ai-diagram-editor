import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

// This test targets the current .ts source without needing a Vite test runner.
let source = readFileSync(new URL('./buildEditPreview.ts', import.meta.url), 'utf8');
source = source.replace(
  "import { buildUseCaseEditPreview } from './buildUseCaseEditPreview';",
  "const buildUseCaseEditPreview = () => { throw new Error('use-case path should not run'); };",
);
const js = stripTypeScriptTypes(source, { mode: 'strip' });
const { buildEditPreview } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

const blank = {
  kind: 'REMOVE_EDGE', targetId: 'e2', tempId: '', source: '', target: '', className: '',
  attributes: [], removeAttributes: [], methods: [], label: '', shape: '', relationType: '',
  evidence: '', sourceMultiplicity: '', targetMultiplicity: '',
};
const nodes = [
  { id: 'a', type: 'classNode', position: { x: 0, y: 0 }, data: { className: 'A', attributes: [], methods: [] } },
  { id: 'b', type: 'classNode', position: { x: 200, y: 0 }, data: { className: 'B', attributes: [], methods: [] } },
];
const classEdge = (id) => ({ id, type: 'classUmlEdge', source: 'a', target: 'b', data: { relationType: 'association' } });
const flowNodes = nodes.map((node) => ({ ...node, type: 'flowchartNode', data: { label: node.id, shape: 'process' } }));
const flowEdge = (id, type = 'flow') => ({ id, type: 'flowchartEdge', source: 'a', target: 'b', data: { relationType: type } });

test('class preview removes one duplicate from draft only', () => {
  const originals = [classEdge('e1'), classEdge('e2')];
  const draft = buildEditPreview('CLASS', nodes, originals, [blank]);
  assert.deepEqual(draft.edges.map((edge) => edge.id), ['e1']);
  assert.equal(originals.length, 2);
  assert.equal(nodes.length, 2);
  assert.match(draft.changes[0], /관계선 제거/);
});

test('explicit issue supports deletion of a uniquely wrong class edge', () => {
  const issue = { targetId: 'e2', title: '불필요한 관계선', suggestion: '관계선을 제거해주세요' };
  assert.equal(buildEditPreview('CLASS', nodes, [classEdge('e2')], [blank], '', '', issue).edges.length, 0);
});

test('class unknown or unsupported edge remains protected', () => {
  assert.throws(() => buildEditPreview('CLASS', nodes, [classEdge('e1')], [blank]), /안전하게 자동 제거/);
  assert.throws(() => buildEditPreview('CLASS', nodes, [flowEdge('e2')], [blank]), /안전하게 자동 제거/);
});

test('flowchart exact duplicates work and yes/no remain distinct', () => {
  const original = [flowEdge('e1'), flowEdge('e2')];
  const draft = buildEditPreview('FLOWCHART', flowNodes, original, [blank]);
  assert.deepEqual(draft.edges.map((edge) => edge.id), ['e1']);
  assert.equal(original.length, 2);
  assert.throws(() => buildEditPreview('FLOWCHART', flowNodes,
    [flowEdge('e1', 'yes'), flowEdge('e2', 'no')], [blank]), /안전하게 자동 제거/);
});

test('no multiple removals; no source/target rewiring', () => {
  const originals = [classEdge('e1'), classEdge('e2'), classEdge('e3')];
  assert.throws(() => buildEditPreview('CLASS', nodes, originals,
    [{ ...blank, targetId: 'e1' }, { ...blank, targetId: 'e2' }]), /안전하게 자동 제거/);
  assert.throws(() => buildEditPreview('CLASS', nodes, originals,
    [{ ...blank, source: 'x' }]), /안전하게 자동 제거/);
});
