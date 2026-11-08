import { useCallback, useRef, useState } from 'react';

import {
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';

import type { DiagramNode, DiagramEdge, DiagramType } from './types/diagram';
import type { DiagramRelationType } from './diagrams/toolPanelTypes';
import { diagramRegistry, updateEdgeRelation } from './diagrams/registry';
import { classDiagramConfig } from './diagrams/class/config';
import AiPanel from './components/AiPanel';
import { analyzeDiagram } from './api/ai';
import type { AiAnalysisResult } from './types/ai';
import { useAiEditPreview } from './ai/useAiEditPreview';
import UmlEdgeEditModal from './diagrams/class/UmlEdgeEditModal';
import type { UmlEdgeData } from './diagrams/class/types';

import TopToolbar from './components/TopToolbar';
import ShapeSidebar from './components/ShapeSidebar';
import DiagramCanvas from './components/DiagramCanvas';
import NodeEditModal from './components/editor/NodeEditModal';

import './App.css';

type AnalysisSnapshot = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

function App() {
  const [diagramType, setDiagramType] = useState<DiagramType>(
    classDiagramConfig.diagramType
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>(
    structuredClone(diagramRegistry.CLASS.initialNodes)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<DiagramEdge>(
    structuredClone(diagramRegistry.CLASS.initialEdges)
  );
  const [relationType, setRelationType] = useState<DiagramRelationType>(
    diagramRegistry.CLASS.defaultRelationType
  );

  // Ignore AI replies if the diagram is reset, switched or the panel is closed.
  const analysisRequestId = useRef(0);

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const editingNode = nodes.find((node) => node.id === editingNodeId);

  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const editingEdge = edges.find((edge) => edge.id === editingEdgeId);

  const handleEdgeDoubleClick: EdgeMouseHandler<DiagramEdge> = (
    _event,
    edge
  ) => {
    if (edge.type !== 'umlEdge') return;
    setEditingNodeId(null);
    setEditingEdgeId(edge.id);
  };

  const hasSelectedEdge = edges.some((edge) => edge.selected);
  const hasSelection = nodes.some((node) => node.selected) || hasSelectedEdge;

  // 실제 관계선 생성 방식은 선택한 다이어그램의 모듈이 결정한다.
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = diagramRegistry[diagramType].createEdge(
        connection,
        relationType
      );
      setEdges((current) => [...current, newEdge]);
    },
    [diagramType, relationType, setEdges]
  );

  // 사이드바는 다이어그램 종류와 도구 이름만 전달한다.
  // USE_CASE 생성 함수는 기존 코드에서 미구현이므로 이 단계에서는 새로 구현하지 않는다.
  const addNode = (type: DiagramType, toolType: string) => {
    setNodes((current) => {
      const newNode = diagramRegistry[type].createNode(toolType, current);
      return newNode ? [...current, newNode] : current;
    });
  };

  const handleNodeDoubleClick: NodeMouseHandler<DiagramNode> = (
    _event,
    node
  ) => {
    setEditingNodeId(node.id);
    setEditingEdgeId(null);
  };

  // 기존 병합 때 수정한 타입 안전한 저장 방식 유지
  const handleSaveNode = (updatedNode: DiagramNode) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === updatedNode.id && node.type === updatedNode.type
          ? updatedNode
          : node
      )
    );
    setEditingNodeId(null);
  };

  const handleSaveEdge = (edgeId: string, updatedData: UmlEdgeData) => {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === edgeId && edge.type === 'umlEdge'
          ? { ...edge, data: { ...edge.data, ...updatedData } }
          : edge
      )
    );
    setEditingEdgeId(null);
  };

  const closeEditModal = useCallback(() => {
    setEditingNodeId(null);
  }, []);

  const applyRelationToSelected = () => {
    setEdges((current) =>
      current.map((edge) =>
        edge.selected ? updateEdgeRelation(edge, relationType) : edge
      )
    );
  };

  const deleteSelected = () => {
    const selectedNodeIds = new Set(
      nodes.filter((node) => node.selected).map((node) => node.id)
    );
    setNodes((current) =>
      current.filter((node) => !selectedNodeIds.has(node.id))
    );
    setEdges((current) =>
      current.filter(
        (edge) =>
          !edge.selected &&
          !selectedNodeIds.has(edge.source) &&
          !selectedNodeIds.has(edge.target)
      )
    );
  };

  const resetDiagram = (type: DiagramType = diagramType) => {
    const module = diagramRegistry[type];
    setEditingNodeId(null);
    setEditingEdgeId(null);
    setRelationType(module.defaultRelationType);
    analysisRequestId.current += 1;
    setAiLoading(false);
    setAiResult(null);
    setAiError(null);
    setAnalysisSnapshot(null);
    setShowEditPreview(false);
    aiEdits.cancel();
    setNodes(structuredClone(module.initialNodes));
    setEdges(structuredClone(module.initialEdges));
  };

  const changeDiagramType = (type: DiagramType) => {
    setDiagramType(type);
    resetDiagram(type);
  };

  // 설계 목적은 사용자가 입력하고, 패널을 열어도 자동 분석하지 않는다.
  const [diagramPurpose, setDiagramPurpose] = useState('');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [analysisSnapshot, setAnalysisSnapshot] = useState<AnalysisSnapshot | null>(null);
  const [showEditPreview, setShowEditPreview] = useState(false);

  const aiEdits = useAiEditPreview({
    diagramType,
    purpose: diagramPurpose,
    nodes, edges, setNodes, setEdges,
  });

  const runAiAnalysis = async () => {
    if (aiLoading) return;
    aiEdits.cancel();
    setShowEditPreview(false);

    if (!diagramPurpose.trim()) {
      setAiError('설계 목적을 입력해 주세요.');
      return;
    }
    if (nodes.length === 0) {
      setAiError('분석할 다이어그램 요소가 없습니다.');
      return;
    }

    // Snapshot the exact graph being submitted for analysis.
    setAnalysisSnapshot({
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    });
    const requestId = ++analysisRequestId.current;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const result = await analyzeDiagram({
        diagramType,
        purpose: diagramPurpose,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          type: edge.type,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          data: edge.data,
        })),
      });
      if (requestId === analysisRequestId.current) setAiResult(result);
    } catch (error) {
      if (requestId === analysisRequestId.current) setAiError(
        error instanceof Error ? error.message : 'AI 분석 중 오류가 발생했습니다.'
      );
    } finally {
      if (requestId === analysisRequestId.current) setAiLoading(false);
    }
  };

  const handleProposeEdit = (issue: Parameters<typeof aiEdits.propose>[0], index: number) => {
    setShowEditPreview(false);
    void aiEdits.propose(issue, index);
  };

  const handleApplyEdit = () => {
    const draft = aiEdits.preview;
    if (draft && aiEdits.apply()) {
      // The accepted version becomes the new base shown on the right.
      setAnalysisSnapshot({
        nodes: structuredClone(draft.nodes),
        edges: structuredClone(draft.edges),
      });
      // Keep unrelated advice; remove only the issue that was actually applied.
      // Preview and cancel do not modify the analysis result.
      setAiResult((current) =>
        current
          ? {
              ...current,
              issues: current.issues.filter((_, index) => index !== draft.issueIndex),
            }
          : null
      );
      setShowEditPreview(false);
    }
  };

  const visiblePreview = showEditPreview ? aiEdits.preview : null;
  const visibleGraph = visiblePreview ?? analysisSnapshot ?? { nodes, edges };

  return (
    <div className="app">
      <TopToolbar
        onReset={() => resetDiagram()}
        diagramType={diagramType}
        onDiagramTypeChange={changeDiagramType}
        onAnalyze={() => setAiPanelOpen(true)}
        analyzing={aiLoading}
      />

      {aiPanelOpen ? (
        <section
          className={`ai-analysis-workspace${visiblePreview ? ' ai-preview-mode' : ''}`}
          aria-label="AI 분석 화면"
        >
          <AiPanel
            purpose={diagramPurpose}
            onPurposeChange={setDiagramPurpose}
            result={aiResult}
            loading={aiLoading}
            error={aiError}
            onAnalyze={runAiAnalysis}
            onClose={() => {
              analysisRequestId.current += 1;
              aiEdits.cancel();
              setAiLoading(false);
              setShowEditPreview(false);
              setAiPanelOpen(false);
            }}
            diagramType={diagramType}
            editPreview={aiEdits.preview}
            editLoading={aiEdits.loading}
            editError={aiEdits.error}
            isPreviewVisible={Boolean(visiblePreview)}
            onProposeEdit={handleProposeEdit}
            onShowPreview={(index) => {
              if (aiEdits.preview?.issueIndex === index) setShowEditPreview(true);
            }}
            onShowOriginal={() => setShowEditPreview(false)}
            onApplyEdit={handleApplyEdit}
            onCancelEdit={() => {
              aiEdits.cancel();
              setShowEditPreview(false);
            }}
          />
          <div className="ai-analysis-graph">
            <div className="ai-analysis-graph-header">
              <strong>
                {visiblePreview
                  ? 'AI 수정안 미리보기'
                  : analysisSnapshot ? '분석 당시 다이어그램' : '현재 다이어그램'}
              </strong>
              <span>
                {visiblePreview
                  ? '승인하기 전까지 실제 다이어그램은 바뀌지 않습니다.'
                  : analysisSnapshot
                      ? 'AI 분석에 사용한 원본 상태입니다.'
                      : 'AI 분석을 실행하면 현재 다이어그램이 기준으로 보관됩니다.'}
              </span>
            </div>
            <DiagramCanvas
              key={visiblePreview ? 'ai-draft' : 'ai-original'}
              nodes={visibleGraph.nodes}
              edges={visibleGraph.edges}
              readOnly
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDoubleClick={handleNodeDoubleClick}
              enableDelete={false}
              onEdgeDoubleClick={handleEdgeDoubleClick}
            />
          </div>
        </section>
      ) : (
        <div className="editor-layout">
          <ShapeSidebar
            diagramType={diagramType}
            onAddNode={addNode}
            relationType={relationType}
            onSelectRelationType={setRelationType}
            onApplyRelationToSelected={applyRelationToSelected}
            onDeleteSelected={deleteSelected}
            hasSelectedEdge={hasSelectedEdge}
            hasSelection={hasSelection}
          />
          <DiagramCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={handleNodeDoubleClick}
            enableDelete={editingNodeId === null && editingEdgeId === null}
            onEdgeDoubleClick={handleEdgeDoubleClick}
          />
        </div>
      )}

      {editingNode && (
        <NodeEditModal
          key={editingNode.id}
          node={editingNode}
          onSave={handleSaveNode}
          onClose={closeEditModal}
        />
      )}
      {editingEdge && editingEdge.type === 'umlEdge' && (
        <UmlEdgeEditModal
          key={editingEdge.id}
          edge={editingEdge}
          onSave={handleSaveEdge}
          onClose={() => setEditingEdgeId(null)}
        />
      )}
    </div>
  );
}

export default App;
