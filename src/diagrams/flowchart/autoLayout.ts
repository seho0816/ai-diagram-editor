import type { DiagramNode, DiagramEdge } from '../../types/diagram';

export type LayoutDirection = 'vertical' | 'horizontal';

export type FlowchartLayoutResult = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

/** Approximate rendered dimensions used to choose the nearest connection sides. */
function dimensions(node: DiagramNode): { width: number; height: number } {
  if (node.type !== 'flowchartNode') return { width: 150, height: 64 };
  if (node.data.shape === 'decision') return { width: 160, height: 112 };
  if (node.data.shape === 'startEnd') return { width: 140, height: 54 };
  return { width: 150, height: 64 };
}

/** Only rearrange flowchart edge endpoints; preserve edge IDs, direction and relation data. */
function arrangeEdgeHandles(
  nodes: DiagramNode[], edges: DiagramEdge[], direction: LayoutDirection,
): DiagramEdge[] {
  const byId = new Map(nodes.filter((node) => node.type === 'flowchartNode').map((node) => [node.id, node]));
  return edges.map((edge) => {
    if (edge.type !== 'flowchartEdge') return edge;
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) return edge;
    const sourceSize = dimensions(source);
    const targetSize = dimensions(target);
    const dx = (target.position.x + targetSize.width / 2) - (source.position.x + sourceSize.width / 2);
    const dy = (target.position.y + targetSize.height / 2) - (source.position.y + sourceSize.height / 2);
    const relation = edge.data?.relationType;

    let sourceHandle: string;
    let targetHandle: string;
    if (edge.source === edge.target) {
      sourceHandle = direction === 'vertical' ? 'right' : 'bottom';
      targetHandle = direction === 'vertical' ? 'top' : 'left';
    } else if (direction === 'vertical') {
      if (dy > 24) {
        // Normal flows exit underneath. Condition branches fan out from the diamond sides.
        sourceHandle = source.data.shape === 'decision' && (relation === 'yes' || relation === 'no') && Math.abs(dx) > 40
          ? (dx < 0 ? 'left' : 'right') : 'bottom';
        targetHandle = 'top';
      } else if (dy < -24) {
        // Backward loops must not point down into a node above the source.
        sourceHandle = dx < 0 ? 'left' : 'right';
        targetHandle = dx < 0 ? 'right' : 'left';
      } else {
        sourceHandle = dx < 0 ? 'left' : 'right';
        targetHandle = dx < 0 ? 'right' : 'left';
      }
    } else if (dx > 24) {
      sourceHandle = 'right';
      targetHandle = 'left';
    } else if (dx < -24) {
      sourceHandle = dy < 0 ? 'top' : 'bottom';
      targetHandle = dy < 0 ? 'bottom' : 'top';
    } else {
      sourceHandle = dy < 0 ? 'top' : 'bottom';
      targetHandle = dy < 0 ? 'bottom' : 'top';
    }
    return { ...edge, sourceHandle, targetHandle };
  });
}

/** Layout both node positions and flowchart edge attachment points. */
export function layoutFlowchart(
  nodes: DiagramNode[], edges: DiagramEdge[], direction: LayoutDirection,
): FlowchartLayoutResult {
  const flowNodes = nodes.filter((node) => node.type === 'flowchartNode');
  if (!flowNodes.length) return { nodes, edges };
  const byId = new Map(flowNodes.map((node) => [node.id, node]));
  const out = new Map(flowNodes.map((node) => [node.id, [] as string[]]));
  const indegree = new Map(flowNodes.map((node) => [node.id, 0]));
  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) continue;
    out.get(edge.source)!.push(edge.target);
    indegree.set(edge.target, indegree.get(edge.target)! + 1);
  }
  const starts = flowNodes.filter((node) => node.data.shape === 'startEnd' && /시작|start/i.test(node.data.label));
  const roots = [...starts, ...flowNodes.filter((node) => indegree.get(node.id) === 0)]
    .filter((node, index, all) => all.findIndex((item) => item.id === node.id) === index);
  const rank = new Map<string, number>();
  // Breadth-first traversal prevents loops from expanding ranks indefinitely.
  function visit(root: DiagramNode, initialRank: number) {
    const queue: { id: string; depth: number }[] = [{ id: root.id, depth: initialRank }];
    rank.set(root.id, initialRank);
    for (let index = 0; index < queue.length; index++) {
      const { id, depth } = queue[index];
      for (const next of out.get(id) ?? []) {
        if (rank.has(next)) continue;
        rank.set(next, depth + 1);
        queue.push({ id: next, depth: depth + 1 });
      }
    }
  }
  for (const root of roots) if (!rank.has(root.id)) visit(root, 0);
  // Disconnected components and pure cycles are each placed on new levels.
  for (const node of flowNodes) {
    if (!rank.has(node.id)) visit(node, Math.max(-1, ...rank.values()) + 1);
  }
  // Bring terminal-only nodes to the final level when incoming edges exist.
  const maxRank = Math.max(...rank.values());
  for (const node of flowNodes) {
    if (node.data.shape === 'startEnd' && /종료|end/i.test(node.data.label) && indegree.get(node.id)! > 0) {
      rank.set(node.id, maxRank + 1);
    }
  }
  const layers = new Map<number, typeof flowNodes>();
  for (const node of flowNodes) {
    const level = rank.get(node.id)!;
    if (!layers.has(level)) layers.set(level, []);
    layers.get(level)!.push(node);
  }
  const positions = new Map<string, { x: number; y: number }>();
  const gapPrimary = direction === 'vertical' ? 185 : 265;
  const gapSecondary = direction === 'vertical' ? 235 : 190;
  const origin = { x: 150, y: 125 };
  // Connected nodes follow their parent's lane, with YES biased to left and NO right.
  const lane = new Map<string, number>();
  const ordered = [...layers.keys()].sort((a, b) => a - b);
  for (const level of ordered) {
    const group = layers.get(level)!;
    group.sort((a, b) => {
      const getScore = (nodeId: string) => {
        const parents = edges.filter((edge) => edge.target === nodeId && lane.has(edge.source));
        if (!parents.length) return 0;
        return parents.reduce((sum, edge) => {
          const type = edge.type === 'flowchartEdge' ? edge.data?.relationType : undefined;
          return sum + lane.get(edge.source)! + (type === 'yes' ? -0.65 : type === 'no' ? 0.65 : 0);
        }, 0) / parents.length;
      };
      return getScore(a.id) - getScore(b.id) || a.id.localeCompare(b.id);
    });
    const count = group.length;
    group.forEach((node, index) => {
      const secondary = (index - (count - 1) / 2) * gapSecondary;
      lane.set(node.id, secondary / gapSecondary);
      positions.set(node.id, direction === 'vertical'
        ? { x: origin.x + secondary + 350, y: origin.y + level * gapPrimary }
        : { x: origin.x + level * gapPrimary, y: origin.y + secondary + 260 });
    });
  }
  const arrangedNodes = nodes.map((node) => {
    const position = positions.get(node.id);
    return position ? { ...node, position } : node;
  });
  return { nodes: arrangedNodes, edges: arrangeEdgeHandles(arrangedNodes, edges, direction) };
}
