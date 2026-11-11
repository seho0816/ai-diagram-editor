import type { DiagramEdge, DiagramNode, DiagramType } from '../types/diagram';
import type { AiEditOperation } from '../types/aiEdits';

const classRelations = new Set([
  'association', 'generalization', 'aggregation', 'composition', 'dependency',
]);
const flowRelations = new Set(['flow', 'yes', 'no']);
const flowShapes = new Set(['startEnd', 'process', 'decision', 'inputOutput']);

type PreviewGraph = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  changes: string[];
};

function text(value: unknown, max = 160): string {
  if (typeof value !== 'string' || value.length > max) {
    throw new Error('AI가 잘못된 텍스트 데이터를 반환했습니다.');
  }
  return value;
}
function attributeToken(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
function lines(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 30 ||
    !value.every((entry) => typeof entry === 'string' && entry.length <= 200)) {
    throw new Error('AI가 잘못된 속성 또는 메서드 목록을 반환했습니다.');
  }
  return value;
}

/** Creates an isolated copy. No modifications are made to live React Flow state. */
export function buildEditPreview(
  diagramType: DiagramType,
  originalNodes: DiagramNode[],
  originalEdges: DiagramEdge[],
  operations: AiEditOperation[]
): PreviewGraph {
  if (diagramType !== 'CLASS' && diagramType !== 'FLOWCHART') {
    throw new Error('이 다이어그램의 자동 수정은 아직 지원하지 않습니다.');
  }
  if (!Array.isArray(operations) || operations.length < 1 || operations.length > 4) {
    throw new Error('적용할 수 있는 수정 연산이 없습니다.');
  }

  const nodes: DiagramNode[] = structuredClone(originalNodes);
  const edges: DiagramEdge[] = structuredClone(originalEdges);
  const idAliases = new Map<string, string>();
  const changes: string[] = [];
  const isClass = diagramType === 'CLASS';
  const nodeType = isClass ? 'classNode' : 'flowchartNode';
  const edgeType = isClass ? 'umlEdge' : 'flowchartEdge';
  const relations = isClass ? classRelations : flowRelations;

  const resolveNode = (id: string) => idAliases.get(id) ?? id;
  const allowedNode = (id: string) =>
    nodes.some((node) => node.id === resolveNode(id) && node.type === nodeType);

  for (const op of operations) {
    if (!op || typeof op !== 'object') throw new Error('잘못된 수정 연산입니다.');
    if (op.kind === 'ADD_NODE') {
      if (!/^new:[a-zA-Z0-9_-]{1,32}$/.test(op.tempId) || idAliases.has(op.tempId)) {
        throw new Error('새 노드의 임시 ID가 올바르지 않습니다.');
      }
      const id = crypto.randomUUID();
      const x = Math.max(100, ...nodes.map((node) => node.position.x)) + 220;
      const y = 100 + idAliases.size * 145;
      if (isClass) {
        const className = text(op.className).trim();
        if (!className) throw new Error('새 클래스 이름이 없습니다.');
        nodes.push({
          id, type: 'classNode', position: { x, y },
          data: { className, attributes: lines(op.attributes), methods: lines(op.methods) },
        });
        changes.push(`클래스 추가: ${className}`);
      } else {
        const label = text(op.label).trim();
        if (!label || !flowShapes.has(op.shape)) throw new Error('새 플로우차트 도형이 올바르지 않습니다.');
        nodes.push({
          id, type: 'flowchartNode', position: { x, y },
          data: { label, shape: op.shape as 'startEnd' | 'process' | 'decision' | 'inputOutput' },
        });
        changes.push(`플로우차트 도형 추가: ${label}`);
      }
      idAliases.set(op.tempId, id);
    } else if (op.kind === 'UPDATE_NODE') {
      const index = nodes.findIndex((node) => node.id === op.targetId && node.type === nodeType);
      if (index === -1) throw new Error('AI가 존재하지 않는 노드를 수정하려 했습니다.');
      const node = nodes[index];
      if (node.type === 'classNode' && isClass) {
        const className = text(op.className).trim();
        if (!className) throw new Error('클래스 이름이 올바르지 않습니다.');
        // 분석 항목에서 명시적으로 지정된 기존 속성만 제거할 수 있다.
        // 클래스/관계선 자체 삭제는 허용하지 않으며 최종 승인이 필요하다.
        const removeAttributes = lines(op.removeAttributes ?? []);
        const removedTokens = new Set(removeAttributes.map(attributeToken));
        const available = new Set(node.data.attributes.map(attributeToken));
        if (removedTokens.size > 5 || [...removedTokens].some((attr) => !available.has(attr))) {
          throw new Error('AI가 실제로 존재하지 않는 클래스 속성을 제거하려 했습니다.');
        }
        const retained = node.data.attributes.filter((attr) => !removedTokens.has(attributeToken(attr)));
        const additions = lines(op.attributes).filter((attr) => !removedTokens.has(attributeToken(attr)));
        const attributes = [...new Set([...retained, ...additions])];
        const methods = [...new Set([...node.data.methods, ...lines(op.methods)])];
        nodes[index] = {
          ...node,
          data: { className, attributes, methods },
        };
        changes.push(`클래스 수정: ${node.data.className} → ${className} (속성 ${node.data.attributes.length}→${attributes.length}, 메서드 ${node.data.methods.length}→${methods.length})`);
        if (removedTokens.size) changes.push(`속성 제거: ${removeAttributes.join(', ')}`);
      } else if (node.type === 'flowchartNode' && !isClass) {
        const label = text(op.label).trim();
        if (!label || !flowShapes.has(op.shape)) throw new Error('플로우차트 도형 데이터가 올바르지 않습니다.');
        nodes[index] = {
          ...node,
          data: { label, shape: op.shape as 'startEnd' | 'process' | 'decision' | 'inputOutput' },
        };
        changes.push(`플로우차트 도형 수정: ${label}`);
      } else {
        throw new Error('AI 수정안의 노드 타입이 일치하지 않습니다.');
      }
    } else if (op.kind === 'ADD_EDGE') {
      if (!allowedNode(op.source) || !allowedNode(op.target) || !relations.has(op.relationType)) {
        throw new Error('AI가 잘못된 관계선 또는 연결 대상을 제안했습니다.');
      }
      if (isClass) {
        edges.push({
          id: crypto.randomUUID(),
          type: 'umlEdge',
          source: resolveNode(op.source), target: resolveNode(op.target),
          sourceHandle: 'right', targetHandle: 'left',
          data: {
            relationType: op.relationType as 'association' | 'generalization' | 'aggregation' | 'composition' | 'dependency',
            ...(op.sourceMultiplicity ? { sourceMultiplicity: text(op.sourceMultiplicity, 20) } : {}),
            ...(op.targetMultiplicity ? { targetMultiplicity: text(op.targetMultiplicity, 20) } : {}),
          },
        });
      } else {
        edges.push({
          id: crypto.randomUUID(), type: 'flowchartEdge',
          source: resolveNode(op.source), target: resolveNode(op.target),
          sourceHandle: 'right', targetHandle: 'left',
          data: { relationType: op.relationType as 'flow' | 'yes' | 'no' },
        });
      }
      changes.push(`관계선 추가: ${op.source} → ${op.target} (${op.relationType})`);
    } else if (op.kind === 'UPDATE_EDGE') {
      const index = edges.findIndex((edge) => edge.id === op.targetId && edge.type === edgeType);
      if (index === -1 || !relations.has(op.relationType)) {
        throw new Error('AI가 존재하지 않는 관계선을 변경하려 했습니다.');
      }
      const edge = edges[index];
      if (edge.type === 'umlEdge' && isClass) {
        edges[index] = {
          ...edge,
          data: {
            ...edge.data,
            relationType: op.relationType as 'association' | 'generalization' | 'aggregation' | 'composition' | 'dependency',
            ...(op.sourceMultiplicity ? { sourceMultiplicity: text(op.sourceMultiplicity, 20) } : {}),
            ...(op.targetMultiplicity ? { targetMultiplicity: text(op.targetMultiplicity, 20) } : {}),
          },
        };
      } else if (edge.type === 'flowchartEdge' && !isClass) {
        edges[index] = { ...edge, data: { ...edge.data, relationType: op.relationType as 'flow' | 'yes' | 'no' } };
      } else {
        throw new Error('AI가 잘못된 관계선 타입을 제안했습니다.');
      }
      changes.push(`관계선 종류 변경: ${op.targetId} → ${op.relationType}`);
    } else {
      throw new Error('안전하게 처리할 수 없는 AI 수정 연산입니다.');
    }
  }

  // 실제 변경이 없는 제안은 미리보기를 제공하지 않는다.
  if (JSON.stringify(nodes) === JSON.stringify(originalNodes) &&
      JSON.stringify(edges) === JSON.stringify(originalEdges)) {
    throw new Error('AI가 원본과 동일한 수정안을 생성했습니다. 다른 항목을 선택하거나 다시 생성해 주세요.');
  }

  return { nodes, edges, changes };
}
