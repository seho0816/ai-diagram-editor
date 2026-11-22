import type { DiagramEdge, DiagramNode } from '../types/diagram';

export type DiffCount = { added: number; changed: number; removed: number };

export type PreviewDiffGraph = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  nodeCount: DiffCount;
  edgeCount: DiffCount;
};

type ElementWithClass = { className?: string };

function withHighlight<T extends ElementWithClass>(element: T, kind: 'added' | 'changed' | 'removed'): T {
  return {
    ...element,
    className: [element.className, `ai-diff-${kind}`].filter(Boolean).join(' '),
  };
}

// JSON 객체의 키 순서 차이와 React Flow의 일시적인 selection/dragging 상태는 제외한다.
function stableJson(value: unknown): string | undefined {
  return JSON.stringify(value, (_key, entry: unknown) => {
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      return Object.fromEntries(
        Object.entries(entry).sort(([left], [right]) => left.localeCompare(right)),
      );
    }
    return entry;
  });
}

function nodeContent(node: DiagramNode) {
  return {
    type: node.type,
    position: node.position,
    parentId: node.parentId,
    extent: node.extent,
    hidden: node.hidden,
    data: node.data,
    style: node.style,
    width: node.width,
    height: node.height,
  };
}

function edgeContent(edge: DiagramEdge) {
  return {
    type: edge.type,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    hidden: edge.hidden,
    data: edge.data,
    label: edge.label,
    style: edge.style,
  };
}

/**
 * 화면 표시용 노드/관계선만 만든다. 원본과 AI 수정안은 절대 변경하지 않는다.
 * 삭제 요소는 수정안에서 사라졌더라도 원본 위치에 점선 '잔상'으로 표시한다.
 */
export function buildPreviewDiff(
  beforeNodes: DiagramNode[],
  beforeEdges: DiagramEdge[],
  afterNodes: DiagramNode[],
  afterEdges: DiagramEdge[],
): PreviewDiffGraph {
  const nodeCount: DiffCount = { added: 0, changed: 0, removed: 0 };
  const edgeCount: DiffCount = { added: 0, changed: 0, removed: 0 };
  const originalNodes = new Map(beforeNodes.map((node) => [node.id, node]));
  const originalEdges = new Map(beforeEdges.map((edge) => [edge.id, edge]));
  const afterNodeIds = new Set(afterNodes.map((node) => node.id));
  const afterEdgeIds = new Set(afterEdges.map((edge) => edge.id));

  const highlightedNodes = afterNodes.map((node) => {
    const original = originalNodes.get(node.id);
    if (!original) {
      nodeCount.added += 1;
      return withHighlight(node, 'added');
    }
    if (stableJson(nodeContent(original)) !== stableJson(nodeContent(node))) {
      nodeCount.changed += 1;
      return withHighlight(node, 'changed');
    }
    return node;
  });

  // 삭제된 노드는 동일한 ID로 잔상을 복원해 삭제 관계선의 끝점도 찾을 수 있게 한다.
  const removedNodes = beforeNodes
    .filter((node) => !afterNodeIds.has(node.id))
    .map((node) => {
      nodeCount.removed += 1;
      return {
        ...withHighlight(node, 'removed'),
        selected: false,
        dragging: false,
        draggable: false,
        selectable: false,
        connectable: false,
      } as DiagramNode;
    });

  const highlightedEdges = afterEdges.map((edge) => {
    const original = originalEdges.get(edge.id);
    if (!original) {
      edgeCount.added += 1;
      return withHighlight(edge, 'added');
    }
    if (stableJson(edgeContent(original)) !== stableJson(edgeContent(edge))) {
      edgeCount.changed += 1;
      return withHighlight(edge, 'changed');
    }
    return edge;
  });

  // 기존 edge 타입과 data를 그대로 유지해 각 다이어그램의 실제 선 모양을 보여준다.
  const removedEdges = beforeEdges
    .filter((edge) => !afterEdgeIds.has(edge.id))
    .map((edge) => {
      edgeCount.removed += 1;
      return {
        ...withHighlight(edge, 'removed'),
        selected: false,
        selectable: false,
        reconnectable: false,
      } as DiagramEdge;
    });

  return {
    nodes: [...highlightedNodes, ...removedNodes],
    edges: [...highlightedEdges, ...removedEdges],
    nodeCount,
    edgeCount,
  };
}
