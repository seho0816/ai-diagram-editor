import type { DiagramEdge, DiagramNode } from '../types/diagram';
import type { AiEditOperation } from '../types/aiEdits';

// The use-case team owns its node and edge components. This module only
// prepares plain React Flow data; it does not change any of those components.
const NODE_TYPES = new Set([
  'actorNode', 'useCaseNode', 'boundaryNode', 'subsystem', 'externalSystem', 'note',
]);
const EDGE_ENDPOINT_TYPES = new Set([
  'actorNode', 'useCaseNode', 'subsystem', 'externalSystem', 'note',
]);
const RELATIONS = new Set(['association', 'include', 'extend', 'generalization']);

// The existing use-case tool panel and actions use these dimensions.
const SIZE: Record<string, { width: number; height: number }> = {
  actorNode: { width: 90, height: 100 },
  useCaseNode: { width: 150, height: 75 },
  boundaryNode: { width: 300, height: 400 },
  subsystem: { width: 260, height: 180 },
  externalSystem: { width: 130, height: 50 },
  note: { width: 130, height: 50 },
};

type EditableNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  style?: Record<string, unknown>;
  zIndex?: number;
};
type EditableEdge = {
  id: string;
  type?: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: Record<string, unknown>;
};

function label(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 160) {
    throw new Error('AI가 유스케이스 이름을 올바르게 반환하지 않았습니다.');
  }
  return value.trim();
}

/** Return a detached graph. Nothing is written to the actual editor until approval. */
export function buildUseCaseEditPreview(
  originalNodes: DiagramNode[],
  originalEdges: DiagramEdge[],
  operations: AiEditOperation[],
): { nodes: DiagramNode[]; edges: DiagramEdge[]; changes: string[] } {
  if (!Array.isArray(operations) || operations.length === 0 || operations.length > 4) {
    throw new Error('적용할 수 있는 유스케이스 수정안이 없습니다.');
  }

  const nodes = structuredClone(originalNodes) as unknown as EditableNode[];
  const edges = structuredClone(originalEdges) as unknown as EditableEdge[];
  const aliases = new Map<string, string>();
  const changes: string[] = [];

  const resolve = (id: string) => aliases.get(id) ?? id;
  const connectable = (id: string) => nodes.some(
    (node) => node.id === resolve(id) && EDGE_ENDPOINT_TYPES.has(node.type ?? ''),
  );

  for (const op of operations) {
    if (!op || typeof op !== 'object') throw new Error('잘못된 AI 수정 연산입니다.');
    if (op.kind === 'ADD_NODE') {
      if (!/^new:[a-zA-Z0-9_-]{1,32}$/.test(op.tempId) || aliases.has(op.tempId) ||
        nodes.some((node) => node.id === op.tempId) || !NODE_TYPES.has(op.shape)) {
        throw new Error('AI가 추가하려는 유스케이스 도형이 올바르지 않습니다.');
      }
      const name = label(op.label);
      const id = crypto.randomUUID();
      const position = {
        x: Math.max(100, ...nodes.map((node) => node.position.x)) + 220,
        y: 120 + aliases.size * 145,
      };
      nodes.push({
        id,
        type: op.shape,
        position,
        style: { ...SIZE[op.shape] },
        ...(op.shape === 'boundaryNode' ? { zIndex: -1 } : {}),
        data: op.shape === 'boundaryNode' ? { title: name } : { label: name },
      });
      aliases.set(op.tempId, id);
      changes.push(`유스케이스 요소 추가: ${name} (${op.shape})`);
    } else if (op.kind === 'UPDATE_NODE') {
      const index = nodes.findIndex((node) => node.id === op.targetId && NODE_TYPES.has(node.type ?? ''));
      if (index < 0 || (op.shape && op.shape !== nodes[index].type)) {
        throw new Error('AI가 존재하지 않거나 종류가 다른 유스케이스 요소를 수정하려 했습니다.');
      }
      const name = label(op.label);
      const node = nodes[index];
      const nameKey = node.type === 'boundaryNode' ? 'title' : 'label';
      nodes[index] = { ...node, data: { ...node.data, [nameKey]: name } };
      changes.push(`유스케이스 요소 수정: ${op.targetId} → ${name}`);
    } else if (op.kind === 'ADD_EDGE') {
      if (!connectable(op.source) || !connectable(op.target) || !RELATIONS.has(op.relationType)) {
        throw new Error('AI가 유효하지 않은 유스케이스 관계선을 제안했습니다.');
      }
      edges.push({
        id: crypto.randomUUID(),
        type: 'umlEdge', // Keep the use-case team's original type.
        source: resolve(op.source),
        target: resolve(op.target),
        sourceHandle: 'right',
        targetHandle: 'left',
        data: { relationType: op.relationType },
      });
      changes.push(`관계선 추가: ${op.source} → ${op.target} (${op.relationType})`);
    } else if (op.kind === 'UPDATE_EDGE') {
      const index = edges.findIndex((edge) => edge.id === op.targetId && edge.type === 'umlEdge');
      if (index < 0 || !RELATIONS.has(op.relationType)) {
        throw new Error('AI가 존재하지 않는 유스케이스 관계선을 변경하려 했습니다.');
      }
      const edge = edges[index];
      edges[index] = { ...edge, data: { ...edge.data, relationType: op.relationType } };
      changes.push(`관계선 종류 변경: ${op.targetId} → ${op.relationType}`);
    } else {
      throw new Error('노드 또는 관계선 삭제 연산은 지원하지 않습니다.');
    }
  }

  if (JSON.stringify(nodes) === JSON.stringify(originalNodes) &&
      JSON.stringify(edges) === JSON.stringify(originalEdges)) {
    throw new Error('AI가 실제 변경 사항이 없는 수정안을 생성했습니다.');
  }

  return {
    nodes: nodes as unknown as DiagramNode[],
    edges: edges as unknown as DiagramEdge[],
    changes,
  };
}
