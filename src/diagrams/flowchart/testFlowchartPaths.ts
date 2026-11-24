import type { DiagramNode, DiagramEdge } from '../../types/diagram';
import { findStart, MAX_SIMULATION_STEPS, outgoingEdges } from './simulation';

export type FlowchartPathResult = {
  nodeIds: string[];
  branches: ('yes' | 'no')[];
  outcome: 'passed' | 'dead-end' | 'cycle' | 'incomplete';
};
export type FlowchartPathReport = {
  results: FlowchartPathResult[];
  truncated: boolean;
  message?: string;
};

/** Explore reachable conditional routes without modifying the diagram. */
export function testFlowchartPaths(nodes: DiagramNode[], edges: DiagramEdge[], maxCases = 40): FlowchartPathReport {
  const flowNodes = nodes.filter((node) => node.type === 'flowchartNode');
  const flowIds = new Set(flowNodes.map((node) => node.id));
  const flowEdges = edges.filter((edge) => edge.type === 'flowchartEdge' && flowIds.has(edge.source) && flowIds.has(edge.target));
  const start = findStart(flowNodes, flowEdges);
  if (!start) return { results: [], truncated: false, message: '시작 노드를 찾을 수 없습니다.' };
  const results: FlowchartPathResult[] = [];
  const stack: { id: string; nodeIds: string[]; branches: ('yes' | 'no')[] }[] = [{ id: start, nodeIds: [start], branches: [] }];
  let truncated = false;
  while (stack.length) {
    if (results.length >= maxCases) { truncated = true; break; }
    const current = stack.pop()!;
    const node = flowNodes.find((item) => item.id === current.id)!;
    const terminal = node.data.shape === 'startEnd' && /종료|end/i.test(node.data.label);
    if (terminal) {
      results.push({ nodeIds: current.nodeIds, branches: current.branches, outcome: 'passed' });
      continue;
    }
    if (current.nodeIds.length >= MAX_SIMULATION_STEPS) {
      results.push({ nodeIds: current.nodeIds, branches: current.branches, outcome: 'cycle' });
      continue;
    }
    const out = outgoingEdges(current.id, flowNodes, flowEdges);
    if (!out.length) {
      results.push({ nodeIds: current.nodeIds, branches: current.branches, outcome: 'dead-end' });
      continue;
    }
    const decision = node.data.shape === 'decision';
    const choices = decision ? out.filter((edge) => edge.data?.relationType === 'yes' || edge.data?.relationType === 'no') : out;
    if (decision && (!choices.some((edge) => edge.data?.relationType === 'yes') || !choices.some((edge) => edge.data?.relationType === 'no'))) {
      results.push({ nodeIds: current.nodeIds, branches: current.branches, outcome: 'incomplete' });
    }
    if (!choices.length) {
      if (!decision) results.push({ nodeIds: current.nodeIds, branches: current.branches, outcome: 'incomplete' });
      continue;
    }
    // Every selected branch is a separate test case, even if it reaches the same node.
    for (const edge of [...choices].reverse()) {
      if (results.length + stack.length >= maxCases) { truncated = true; break; }
      const branch = decision ? edge.data!.relationType as 'yes' | 'no' : null;
      const path = [...current.nodeIds, edge.target];
      const branches = branch ? [...current.branches, branch] : current.branches;
      if (current.nodeIds.includes(edge.target)) {
        if (results.length + stack.length < maxCases) results.push({ nodeIds: path, branches, outcome: 'cycle' });
        else truncated = true;
      } else {
        stack.push({ id: edge.target, nodeIds: path, branches });
      }
    }
  }
  return { results, truncated };
}
