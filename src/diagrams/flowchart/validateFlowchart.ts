import type { DiagramNode, DiagramEdge } from '../../types/diagram';
import { findStart, outgoingEdges } from './simulation';

export type FlowchartIssue = {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
};

/** Read-only structural inspection. Informational issues never block editing. */
export function validateFlowchart(nodes: DiagramNode[], edges: DiagramEdge[]): FlowchartIssue[] {
  const flowNodes = nodes.filter((node) => node.type === 'flowchartNode');
  const flowIds = new Set(flowNodes.map((node) => node.id));
  const flowEdges = edges.filter((edge) => edge.type === 'flowchartEdge');
  const issues: FlowchartIssue[] = [];
  if (flowNodes.length === 0) return [{ code: 'EMPTY', severity: 'info', message: '플로우차트 도형을 추가하면 자동 검증이 시작됩니다.' }];

  const starts = flowNodes.filter((node) => node.data.shape === 'startEnd' && /시작|start/i.test(node.data.label));
  const ends = flowNodes.filter((node) => node.data.shape === 'startEnd' && /종료|end/i.test(node.data.label));
  if (!starts.length) issues.push({ code: 'START_MISSING', severity: 'error', message: '시작 노드가 없습니다.' });
  if (starts.length > 1) issues.push({ code: 'MULTIPLE_START', severity: 'warning', message: `시작 노드가 ${starts.length}개입니다. 시작점을 확인하세요.` });
  if (!ends.length) issues.push({ code: 'END_MISSING', severity: 'warning', message: '종료 노드가 없습니다.' });

  for (const edge of flowEdges) {
    if (!flowIds.has(edge.source) || !flowIds.has(edge.target)) {
      issues.push({ code: 'BROKEN_EDGE', severity: 'error', message: '존재하지 않는 도형을 참조하는 연결선이 있습니다.' });
    }
  }
  for (const node of flowNodes) {
    const outgoing = outgoingEdges(node.id, flowNodes, flowEdges);
    const isEnd = node.data.shape === 'startEnd' && /종료|end/i.test(node.data.label);
    if (!isEnd && outgoing.length === 0) {
      issues.push({ code: 'DEAD_END', severity: 'warning', nodeId: node.id, message: `「${node.data.label}」에서 나가는 연결선이 없습니다.` });
    }
    if (node.data.shape === 'decision') {
      const yes = outgoing.filter((edge) => edge.data?.relationType === 'yes');
      const no = outgoing.filter((edge) => edge.data?.relationType === 'no');
      if (!yes.length || !no.length) {
        const missing = [!yes.length ? '예' : '', !no.length ? '아니오' : ''].filter(Boolean).join(' / ');
        issues.push({ code: 'MISSING_BRANCH', severity: 'error', nodeId: node.id, message: `「${node.data.label}」의 ${missing} 연결선이 없습니다.` });
      }
      if (yes.length > 1 || no.length > 1) {
        issues.push({ code: 'DUPLICATE_BRANCH', severity: 'warning', nodeId: node.id, message: `「${node.data.label}」에 같은 종류의 조건 연결선이 여러 개 있습니다.` });
      }
      if (yes.length && no.length && yes.every((edge) => no.some((other) => other.target === edge.target))) {
        issues.push({ code: 'SAME_TARGET', severity: 'info', nodeId: node.id, message: `「${node.data.label}」의 예/아니오가 같은 노드로 연결됩니다. 의도한 구조인지 확인하세요.` });
      }
    } else if (outgoing.some((edge) => edge.data?.relationType === 'yes' || edge.data?.relationType === 'no')) {
      issues.push({ code: 'BRANCH_ON_NON_DECISION', severity: 'warning', nodeId: node.id, message: `조건 도형이 아닌 「${node.data.label}」에서 예/아니오 연결선이 나갑니다.` });
    }
  }
  const start = findStart(flowNodes, flowEdges);
  if (start && starts.length > 0) {
    const visited = new Set([start]);
    const queue = [start];
    for (let index = 0; index < queue.length; index++) {
      for (const edge of outgoingEdges(queue[index], flowNodes, flowEdges)) {
        if (!visited.has(edge.target)) { visited.add(edge.target); queue.push(edge.target); }
      }
    }
    for (const node of flowNodes) {
      if (!visited.has(node.id)) issues.push({ code: 'UNREACHABLE', severity: 'warning', nodeId: node.id, message: `시작 노드에서 「${node.data.label}」에 도달할 수 없습니다.` });
    }
  }
  return issues;
}
