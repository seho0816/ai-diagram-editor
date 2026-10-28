
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

import TopToolbar from './components/TopToolbar';
import ShapeSidebar from './components/ShapeSidebar';
import DiagramCanvas from './components/DiagramCanvas';
import NodeEditModal from './components/editor/NodeEditModal';

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

    setNodes(structuredClone(initialNodes));
    setEdges(structuredClone(initialEdges));
  };

  return (
      <div className="app">
        <TopToolbar onReset={resetDiagram} />

        <div className="editor-layout">
          <ShapeSidebar
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
              enableDelete={editingNodeId === null}
          />
        </div>

        {/* 공통 노드 편집 모달 */}
        {editingNode && (
            <NodeEditModal
                key={editingNode.id}
                node={editingNode}
                onSave={handleSaveNode}
                onClose={closeEditModal}
            />
        )}
      </div>
  );
}

export default App;
