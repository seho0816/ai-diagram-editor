
import { useCallback, useState } from 'react';

import {
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeMouseHandler,
} from '@xyflow/react';

import type {
  DiagramNode,
  DiagramEdge,
  ClassDiagramNode,
  UmlDiagramEdge,
  UmlRelationType,
} from './types/diagram';

import type { DiagramType } from './types/diagram';
import AiPanel from './components/AiPanel';
import { analyzeDiagram } from './api/ai';
import type { AiAnalysisResult } from './types/ai';
import { classDiagramConfig } from './diagrams/class/config';

import TopToolbar from './components/TopToolbar';
import ShapeSidebar from './components/ShapeSidebar';
import DiagramCanvas from './components/DiagramCanvas';
import NodeEditModal from './components/editor/NodeEditModal';

import type { EdgeMouseHandler } from '@xyflow/react';

import UmlEdgeEditModal from './diagrams/class/UmlEdgeEditModal';

import type { UmlEdgeData } from
      './diagrams/class/types';

import './App.css';


// 초기 클래스 노드
const initialNodes: DiagramNode[] = [
  {
    id: 'user',
    type: 'classNode',
    position: { x: 100, y: 100 },
    data: {
      className: 'User',
      attributes: [
        '- userId: Long',
        '- name: String',
        '- email: String',
      ],
      methods: [
        '+ login(): boolean',
        '+ logout(): void',
      ],
    },
  },
  {
    id: 'order',
    type: 'classNode',
    position: { x: 450, y: 150 },
    data: {
      className: 'Order',
      attributes: [
        '- orderId: Long',
        '- totalPrice: int',
      ],
      methods: [
        '+ cancel(): void',
        '+ calculateTotal(): int',
      ],
    },
  },
];

// 초기 UML 관계선
const initialEdges: DiagramEdge[] = [
  {
    id: 'user-order',

    source: 'user',
    sourceHandle: 'right',

    target: 'order',
    targetHandle: 'left',

    type: 'umlEdge',
    data: {
      relationType: 'association',
    },
  },
];

function App() {
  // 현재 사용 중인 다이어그램 종류
  const diagramType: DiagramType =
      classDiagramConfig.diagramType;

  // 노드 상태
  const [nodes, setNodes, onNodesChange] =
      useNodesState<DiagramNode>(
          structuredClone(initialNodes)
      );

  // 관계선 상태
  const [edges, setEdges, onEdgesChange] =
      useEdgesState<DiagramEdge>(
          structuredClone(initialEdges)
      );
  
  // 관계선 편집 상태
  const [editingEdgeId, setEditingEdgeId] =
      useState<string | null>(null);

  const editingEdge = edges.find(
      (edge) => edge.id === editingEdgeId
  );

  // 관계선 더블클릭
  const handleEdgeDoubleClick:
      EdgeMouseHandler<DiagramEdge> = (
      _event,
      edge
  ) => {
    setEditingNodeId(null);
    setEditingEdgeId(edge.id);
  };
  
  // 현재 선택한 관계 종류
  const [relationType, setRelationType] =
      useState<UmlRelationType>('association');

  // 편집 중인 노드 ID
  const [editingNodeId, setEditingNodeId] =
      useState<string | null>(null);

  const editingNode = nodes.find(
      (node) => node.id === editingNodeId
  );

  // 선택 여부
  const hasSelectedEdge = edges.some(
      (edge) => edge.selected
  );

  const hasSelection =
      nodes.some((node) => node.selected) ||
      hasSelectedEdge;

  // 관계선 생성

  const onConnect = useCallback(
      (connection: Connection) => {
        const newEdge: UmlDiagramEdge = {
          id: crypto.randomUUID(),

          // 드래그를 시작한 클래스
          source: connection.source,
          sourceHandle: connection.sourceHandle,

          // 드래그를 끝낸 클래스
          target: connection.target,
          targetHandle: connection.targetHandle,

          type: 'umlEdge',

          data: {
            relationType,
          },
        };

        // UML의 의미가 맞는지 검사하지 않고 추가
        setEdges((current) => [...current, newEdge]);
      },
      [setEdges, relationType]
  );


  // 클래스 노드 추가
  const addClass = () => {
    setNodes((current) => {
      const newNode: ClassDiagramNode = {
        id: crypto.randomUUID(),
        type: 'classNode',
        position: {
          x: 150 + current.length * 50,
          y: 100 + current.length * 40,
        },
        data: {
          className: `Class${current.length + 1}`,
          attributes: [],
          methods: [],
        },
      };

      return [...current, newNode];
    });
  };

  // 노드 더블클릭 시 편집
  const handleNodeDoubleClick:
      NodeMouseHandler<DiagramNode> = (
      _event,
      node
  ) => {
    setEditingNodeId(node.id);
    setEditingEdgeId(null);
  };

  // 노드 수정 내용 저장
  const handleSaveNode = (
      updatedNode: DiagramNode
  ) => {
    setNodes((current) =>
        current.map((node) =>
            node.id === updatedNode.id &&
            node.type === updatedNode.type
                ? {
                  ...node,
                  data: updatedNode.data,
                }
                : node
        )
    );

    setEditingNodeId(null);
  };

  const handleSaveEdge = (
      edgeId: string,
      updatedData: UmlEdgeData
  ) => {
    setEdges((current) =>
        current.map((edge) =>
            edge.id === edgeId
                ? {
                  ...edge,
                  data: {
                    ...edge.data,
                    ...updatedData,
                  },
                }
                : edge
        )
    );

    setEditingEdgeId(null);
  };

  // 모달 닫기
  const closeEditModal = useCallback(() => {
    setEditingNodeId(null);
  }, []);

  // 선택된 관계선의 종류 변경
  const applyRelationToSelected = () => {
    setEdges((current) =>
        current.map((edge) => {
          if (!edge.selected) {
            return edge;
          }

          return {
            ...edge,
            data: {
              ...edge.data,
              relationType,
            },
          };
        })
    );
  };

  // 선택한 클래스 / 관계선 삭제
  const deleteSelected = () => {
    const selectedNodeIds = new Set(
        nodes
            .filter((node) => node.selected)
            .map((node) => node.id)
    );

    setNodes((current) =>
        current.filter(
            (node) => !selectedNodeIds.has(node.id)
        )
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

  // 다이어그램 초기화
  const resetDiagram = () => {
    setEditingNodeId(null);
    setRelationType('association');
    setEditingEdgeId(null);
    setNodes(structuredClone(initialNodes));
    setEdges(structuredClone(initialEdges));
  };

  const [diagramPurpose, setDiagramPurpose] =
      useState('쇼핑몰 주문 시스템');

  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);

  const [aiError, setAiError] =
      useState<string | null>(null);

  const [aiResult, setAiResult] =
      useState<AiAnalysisResult | null>(null);

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
          error instanceof Error
              ? error.message
              : 'AI 분석 중 오류가 발생했습니다.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
      <div className="app">
        <TopToolbar
            onReset={resetDiagram}
            onAnalyze={runAiAnalysis}
            analyzing={aiLoading}
        />

        <div className="editor-layout">
          <ShapeSidebar
              diagramType={diagramType}
              onAddClass={addClass}
              relationType={relationType}
              onSelectRelationType={setRelationType}
              onApplyRelationToSelected={
                applyRelationToSelected
              }
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
              enableDelete={
                  editingNodeId === null &&
                  editingEdgeId === null
              }
              onEdgeDoubleClick={handleEdgeDoubleClick}
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
        {/* 공통 노드 편집 모달 */}
        {editingNode && (
            <NodeEditModal
                key={editingNode.id}
                node={editingNode}
                onSave={handleSaveNode}
                onClose={closeEditModal}
            />
        )}
        {editingEdge && (
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
