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

// Guard only AI-proposed edits. The normal editor still accepts user choices.
function isValidSuggestedRelation(relation: string, sourceType?: string, targetType?: string): boolean {
  const actor = (type?: string) => type === 'actorNode' || type === 'externalSystem';
  if (relation === 'association') {
    return (actor(sourceType) && targetType === 'useCaseNode') ||
      (sourceType === 'useCaseNode' && actor(targetType));
  }
  if (relation === 'include' || relation === 'extend') {
    return sourceType === 'useCaseNode' && targetType === 'useCaseNode';
  }
  return relation === 'generalization' && (
    (sourceType === 'actorNode' && targetType === 'actorNode') ||
    (sourceType === 'useCaseNode' && targetType === 'useCaseNode')
  );
}

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

function hasBusinessRuleEvidence(quote: string | undefined, purpose: string, nodes: EditableNode[], businessRule = ''): boolean {
  const normalize = (value: unknown) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  const text = normalize(quote);
  if (!text || !/(반드시|필수|항상|매번|선택|조건|경우|때만|별도|나중|불필요|독립|이후|이전에|가능|해야|하지 않는다|후불|선불.{0,8}(?:아님|아니|않|안)|must|always|optional|only if|when)/i.test(text)) return false;
  return [purpose, businessRule, ...nodes.filter((node) => node.type === 'note').flatMap((node) =>
    [node.data.label, node.data.text, node.data.content])].some((value) => normalize(value).includes(text));
}

function statesSeparateFlow(quote: string | undefined): boolean {
  return /(별도|독립|따로|분리|주문.{0,20}(?:완료|끝난|끝내).{0,20}(?:후|결제)|separate|independent)/i.test(quote ?? '');
}

function supportsConditionalExtension(quote: string | undefined): boolean {
  return /(조건|특정|경우|때만|선택|optional|only if|when)/i.test(quote ?? '');
}

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
  purpose = '',
  businessRule = '',
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
  const nodeType = (id: string) => nodes.find((node) => node.id === resolve(id))?.type;

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
      if (op.source === op.target || !connectable(op.source) || !connectable(op.target) || !RELATIONS.has(op.relationType) ||
        !isValidSuggestedRelation(op.relationType, nodeType(op.source), nodeType(op.target))) {
        throw new Error('AI가 UML 의미에 맞지 않는 유스케이스 관계선을 제안했습니다. 수동으로 확인해 주세요.');
      }
      if (edges.some((edge) => edge.type === 'umlEdge' &&
        ((edge.source === resolve(op.source) && edge.target === resolve(op.target)) ||
         (edge.source === resolve(op.target) && edge.target === resolve(op.source))))) {
        throw new Error('이미 연결된 유스케이스 관계선이 있습니다. 기존 선을 수정해야 합니다.');
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
    } else if (op.kind === 'REMOVE_EDGE') {
      const index = edges.findIndex((edge) => edge.id === op.targetId && edge.type === 'umlEdge');
      if (index < 0) throw new Error('AI가 존재하지 않는 관계선을 제거하려 했습니다.');
      const edge = edges[index];
      if (!['include', 'extend'].includes(String(edge.data?.relationType ?? '')) ||
        nodeType(edge.source) !== 'useCaseNode' || nodeType(edge.target) !== 'useCaseNode' ||
        !hasBusinessRuleEvidence(op.evidence, purpose, nodes, businessRule) ||
        !statesSeparateFlow(op.evidence)) {
        throw new Error('유스케이스 간 독립적인 업무라는 근거가 부족해 관계선 제거를 보류했습니다.');
      }
      edges.splice(index, 1);
      changes.push(`유스케이스 관계선 제거: ${op.targetId} (${String(edge.data?.relationType)}) · 근거: ${op.evidence}`);
    } else if (op.kind === 'UPDATE_EDGE') {
      const index = edges.findIndex((edge) => edge.id === op.targetId && edge.type === 'umlEdge');
      if (index < 0 || !RELATIONS.has(op.relationType)) {
        throw new Error('AI가 존재하지 않는 유스케이스 관계선을 변경하려 했습니다.');
      }
      const edge = edges[index];
      const sameEnds = (op.source === '' && op.target === '') ||
        (op.source === edge.source && op.target === edge.target);
      const reversed = op.source === edge.target && op.target === edge.source && edge.source !== edge.target;
      if (!sameEnds && !reversed) {
        throw new Error('AI는 유스케이스 관계선의 기존 양 끝점을 서로 뒤집을 수만 있습니다.');
      }
      const sourceId = reversed ? edge.target : edge.source;
      const targetId = reversed ? edge.source : edge.target;
      if (sourceId === targetId || !isValidSuggestedRelation(op.relationType, nodeType(sourceId), nodeType(targetId))) {
        throw new Error('유스케이스 관계선의 연결 대상과 종류가 맞지 않습니다.');
      }
      const originalRelation = edge.data?.relationType;
      const twoCases = nodeType(sourceId) === 'useCaseNode' && nodeType(targetId) === 'useCaseNode';
      const needsRule = reversed || (twoCases && originalRelation !== op.relationType &&
        (originalRelation === 'include' || originalRelation === 'extend' ||
         op.relationType === 'include' || op.relationType === 'extend'));
      if (needsRule && (!hasBusinessRuleEvidence(op.evidence, purpose, nodes, businessRule) ||
        (twoCases && op.relationType === 'extend' && !supportsConditionalExtension(op.evidence)))) {
        throw new Error('업무 규칙이 확인되지 않아 유스케이스 관계선 자동 수정을 보류했습니다.');
      }
      edges[index] = {
        ...edge,
        ...(reversed ? {
          source: edge.target, target: edge.source,
          sourceHandle: edge.targetHandle, targetHandle: edge.sourceHandle,
        } : {}),
        data: { ...edge.data, relationType: op.relationType },
      };
      changes.push(`관계선 수정: ${op.targetId} (${String(originalRelation ?? '미지정')} → ${op.relationType})${reversed ? ', 연결 방향 반전' : ''}${needsRule ? ` · 근거: ${op.evidence}` : ''}`);
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
