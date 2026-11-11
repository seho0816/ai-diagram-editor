import { useCallback, useState } from 'react';

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
import UmlEdgeEditModal from './diagrams/class/UmlEdgeEditModal';
import type { UmlEdgeData } from './diagrams/class/types';

import TopToolbar from './components/TopToolbar';
import ShapeSidebar from './components/ShapeSidebar';
import DiagramCanvas from './components/DiagramCanvas';
import NodeEditModal from './components/editor/NodeEditModal';

import './App.css';

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
  // position은 드래그 앤 드롭으로 만들 때만 전달되며, 클릭 추가는 기존 방식 그대로다.
  const addNode = (
    type: DiagramType,
    toolType: string,
    position?: { x: number; y: number }
  ) => {
    setNodes((current) => {
      const newNode = diagramRegistry[type].createNode(toolType, current);
      if (!newNode) return current;
      // 드롭으로 만든 경우에만 놓은 위치로 덮어쓴다
      return [...current, position ? { ...newNode, position } : newNode];
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
    setNodes(structuredClone(module.initialNodes));
    setEdges(structuredClone(module.initialEdges));
  };

  const changeDiagramType = (type: DiagramType) => {
    setDiagramType(type);
    resetDiagram(type);
  };

  // AI 분석은 기존 코드 그대로 유지한다.
  const [diagramPurpose, setDiagramPurpose] = useState('쇼핑몰 주문 시스템');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);

  const runAiAnalysis = async () => {
    setAiPanelOpen(true);
    if (aiLoading) return;

    if (!diagramPurpose.trim()) {
      setAiError('설계 목적을 입력해 주세요.');
      return;
    }
    if (nodes.length === 0) {
      setAiError('분석할 클래스가 없습니다.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const result = await analyzeDiagram({
        diagramType: classDiagramConfig.diagramType,
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
      setAiResult(result);
    } catch (error) {
      setAiError(
        error instanceof Error ? error.message : 'AI 분석 중 오류가 발생했습니다.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="app">
      <TopToolbar
        onReset={() => resetDiagram()}
        diagramType={diagramType}
        onDiagramTypeChange={changeDiagramType}
        onAnalyze={runAiAnalysis}
        analyzing={aiLoading}
      />

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
          onDropNode={(toolType, position) =>
            addNode(diagramType, toolType, position)
          }
        />
      </div>

      {aiPanelOpen && (
        <AiPanel
          purpose={diagramPurpose}
          onPurposeChange={setDiagramPurpose}
          result={aiResult}
          loading={aiLoading}
          error={aiError}
          onAnalyze={runAiAnalysis}
          onClose={() => setAiPanelOpen(false)}
        />
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