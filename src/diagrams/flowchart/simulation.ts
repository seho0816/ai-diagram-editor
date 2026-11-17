import type { DiagramNode, DiagramEdge } from '../../types/diagram';

export const MAX_SIMULATION_STEPS = 100;
export type BranchChoice = 'yes' | 'no';

export function findStart(nodes: DiagramNode[], edges: DiagramEdge[]): string | null {
  const flow = nodes.filter((node) => node.type === 'flowchartNode');
  const explicit = flow.find((node) => node.data.shape === 'startEnd' && /시작|start/i.test(node.data.label));
  if (explicit) return explicit.id;
  const incoming = new Set(edges.map((edge) => edge.target));
  return flow.find((node) => !incoming.has(node.id))?.id ?? null;
}

export function outgoingEdges(id: string, nodes: DiagramNode[], edges: DiagramEdge[]) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  return edges.filter((edge) => edge.source === id && nodeIds.has(edge.target));
}

export function isDecision(id: string, nodes: DiagramNode[]) {
  return nodes.some((node) => node.id === id && node.type === 'flowchartNode' && node.data.shape === 'decision');
}

export function getNextEdge(id: string, nodes: DiagramNode[], edges: DiagramEdge[], branch?: BranchChoice): DiagramEdge | null {
  const outgoing = outgoingEdges(id, nodes, edges);
  if (!outgoing.length) return null;
  if (isDecision(id, nodes)) {
    if (!branch) return null;
    return outgoing.find((edge) => edge.type === 'flowchartEdge' && edge.data?.relationType === branch) ?? null;
  }
  return outgoing[0];
}

export function availableBranches(id: string, nodes: DiagramNode[], edges: DiagramEdge[]) {
  if (!isDecision(id, nodes)) return [];
  const outgoing = outgoingEdges(id, nodes, edges);
  return (['yes', 'no'] as const).filter((type) => outgoing.some((edge) => edge.type === 'flowchartEdge' && edge.data?.relationType === type));
}
