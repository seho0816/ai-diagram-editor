const CLASS_RELATIONS = new Set(['association', 'generalization', 'aggregation', 'composition', 'dependency']);
const FLOW_RELATIONS = new Set(['flow', 'yes', 'no']);
const SHAPES = new Set(['startEnd', 'process', 'decision', 'inputOutput']);
function attributeToken(value) {
  return typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ')
    : '';
}

const ALL_FIELDS = [
  'kind', 'targetId', 'tempId', 'source', 'target', 'className', 'label',
  'shape', 'relationType', 'sourceMultiplicity', 'targetMultiplicity',
];

function shortText(value, maxLength = 300) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
function textLines(value) {
  return Array.isArray(value) && value.length <= 30 && value.every((item) => typeof item === 'string')
    ? value.map((item) => shortText(item, 200))
    : null;
}

// Model output is untrusted. Invalid or unsupported operations are discarded.
export function normalizeAiEditProposal(raw, { diagramType, nodes, edges }) {
  const nodeType = diagramType === 'CLASS' ? 'classNode' : 'flowchartNode';
  const edgeType = diagramType === 'CLASS' ? 'umlEdge' : 'flowchartEdge';
  const relations = diagramType === 'CLASS' ? CLASS_RELATIONS : FLOW_RELATIONS;
  const knownNodes = new Map(nodes.map((node) => [node.id, node.type]));
  const nodeData = new Map(nodes.map((node) => [node.id, node.data]));
  const knownEdges = new Map(edges.map((edge) => [edge.id, edge.type]));
  const aliases = new Set();
  const operations = [];

  for (const rawOperation of (Array.isArray(raw?.operations) ? raw.operations : []).slice(0, 4)) {
    if (!rawOperation || typeof rawOperation !== 'object' ||
      !ALL_FIELDS.every((field) => typeof rawOperation[field] === 'string')) continue;
    const attrs = textLines(rawOperation.attributes);
    const methods = textLines(rawOperation.methods);
    const removeAttributes = textLines(rawOperation.removeAttributes ?? []);
    if (attrs === null || methods === null || removeAttributes === null || removeAttributes.length > 5) continue;
    const op = {
      kind: rawOperation.kind,
      targetId: shortText(rawOperation.targetId, 100),
      tempId: shortText(rawOperation.tempId, 100),
      source: shortText(rawOperation.source, 100),
      target: shortText(rawOperation.target, 100),
      className: shortText(rawOperation.className, 160),
      attributes: attrs,
      removeAttributes,
      methods,
      label: shortText(rawOperation.label, 160),
      shape: shortText(rawOperation.shape, 40),
      relationType: shortText(rawOperation.relationType, 40),
      sourceMultiplicity: shortText(rawOperation.sourceMultiplicity, 20),
      targetMultiplicity: shortText(rawOperation.targetMultiplicity, 20),
    };
    if (op.kind === 'ADD_NODE') {
      if (!/^new:[a-zA-Z0-9_-]{1,32}$/.test(op.tempId) ||
        aliases.has(op.tempId) || knownNodes.has(op.tempId)) continue;
      if (diagramType === 'CLASS' && !op.className) continue;
      if (diagramType === 'FLOWCHART' && (!op.label || !SHAPES.has(op.shape))) continue;
      if (op.removeAttributes.length) continue;
      aliases.add(op.tempId);
    } else if (op.kind === 'UPDATE_NODE') {
      if (knownNodes.get(op.targetId) !== nodeType) continue;
      if (diagramType === 'CLASS') {
        if (!op.className) continue;
        const existing = nodeData.get(op.targetId)?.attributes;
        if (op.removeAttributes.length && !Array.isArray(existing)) continue;
        const available = new Set((Array.isArray(existing) ? existing : []).map(attributeToken));
        if (op.removeAttributes.some((attr) => !available.has(attributeToken(attr)))) continue;
      }
      if (diagramType === 'FLOWCHART' && (!op.label || !SHAPES.has(op.shape) || op.removeAttributes.length)) continue;
    } else if (op.kind === 'ADD_EDGE') {
      if (op.removeAttributes.length) continue;
      const validNode = (id) => knownNodes.get(id) === nodeType || aliases.has(id);
      if (!validNode(op.source) || !validNode(op.target) || !relations.has(op.relationType)) continue;
    } else if (op.kind === 'UPDATE_EDGE') {
      if (op.removeAttributes.length) continue;
      if (knownEdges.get(op.targetId) !== edgeType || !relations.has(op.relationType)) continue;
    } else {
      continue;
    }
    operations.push(op);
  }

  return {
    description: shortText(raw?.description, 500) || '수정할 수 있는 부분을 검토했습니다.',
    operations,
  };
}
