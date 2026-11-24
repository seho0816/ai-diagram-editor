import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DiagramNode, DiagramEdge } from '../../types/diagram';
import { layoutFlowchart, type LayoutDirection } from './autoLayout';
import { validateFlowchart, type FlowchartIssue } from './validateFlowchart';
import { testFlowchartPaths, type FlowchartPathReport } from './testFlowchartPaths';
import { availableBranches, findStart, getNextEdge, MAX_SIMULATION_STEPS, outgoingEdges, type BranchChoice } from './simulation';

type FeatureContext = {
  validationIssues: FlowchartIssue[];
  pathReport: FlowchartPathReport | null;
  runPathTests: () => void;
  direction: LayoutDirection;
  setDirection: (value: LayoutDirection) => void;
  arrange: () => void;
  running: boolean;
  history: string[];
  activeNodeId: string | null;
  error: string | null;
  finished: boolean;
  branches: readonly BranchChoice[];
  start: () => void;
  advance: (branch?: BranchChoice) => void;
  previous: () => void;
  stop: () => void;
  nameOf: (id: string) => string;
};

const Context = createContext<FeatureContext | null>(null);
export function useFlowchartFeatures() { return useContext(Context); }

export function FlowchartFeatureProvider({ nodes, edges, onArrange, children }: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  onArrange: (nodes: DiagramNode[], edges: DiagramEdge[]) => void;
  children: ReactNode;
}) {
  const [direction, setDirection] = useState<LayoutDirection>('vertical');
  const [pathReport, setPathReport] = useState<FlowchartPathReport | null>(null);
  const validationIssues = useMemo(() => validateFlowchart(nodes, edges), [nodes, edges]);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const activeNodeId = history.at(-1) ?? null;
  const running = history.length > 0;
  // Ignore position/selection changes: only graph structure/content changes reset the simulation.
  const signature = useMemo(() => JSON.stringify({
    nodes: nodes.map((n) => [n.id, n.type, n.data]),
    edges: edges.map((e) => [e.id, e.source, e.target, e.data]),
  }), [nodes, edges]);
  useEffect(() => { setHistory([]); setError(null); setFinished(false); setPathReport(null); }, [signature]);

  const stop = () => { setHistory([]); setError(null); setFinished(false); };
  const start = () => {
    const id = findStart(nodes, edges);
    if (!id) { setError('시작 노드를 찾을 수 없습니다. 시작 노드를 추가하거나 연결 관계를 확인하세요.'); return; }
    setHistory([id]); setError(null); setFinished(false);
  };
  const advance = (branch?: BranchChoice) => {
    if (!activeNodeId || finished) return;
    if (history.length >= MAX_SIMULATION_STEPS) {
      setError(`최대 ${MAX_SIMULATION_STEPS}단계에 도달했습니다. 순환 연결을 확인하세요.`);
      setFinished(true);
      return;
    }
    const next = getNextEdge(activeNodeId, nodes, edges, branch);
    if (!next) {
      if (outgoingEdges(activeNodeId, nodes, edges).length) {
        setError('해당 분기 연결선이 없습니다. 예/아니오 연결을 확인하세요.');
      } else { setError(null); setFinished(true); }
      return;
    }
    setHistory((prev) => [...prev, next.target]);
    setError(null);
    const target = nodes.find((node) => node.id === next.target);
    if (target?.type === 'flowchartNode' && target.data.shape === 'startEnd' && /종료|end/i.test(target.data.label)) setFinished(true);
  };
  const previous = () => { setHistory((prev) => prev.slice(0, -1)); setFinished(false); setError(null); };
  const branches = activeNodeId && !finished ? availableBranches(activeNodeId, nodes, edges) : [];
  const value: FeatureContext = {
    validationIssues, pathReport, runPathTests: () => setPathReport(testFlowchartPaths(nodes, edges)),
    direction, setDirection, arrange: () => {
      const arranged = layoutFlowchart(nodes, edges, direction);
      onArrange(arranged.nodes, arranged.edges);
    },
    running, history, activeNodeId, error, finished, branches,
    start, advance, previous, stop,
    nameOf: (id) => {
      const node = nodes.find((item) => item.id === id);
      return node?.type === 'flowchartNode' ? node.data.label : id;
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
