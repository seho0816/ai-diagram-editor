import { useCallback, useState } from 'react';

import {
    useNodesState,
    useEdgesState,
    type Connection,
    type NodeMouseHandler,
    type EdgeMouseHandler,
} from '@xyflow/react';

import type {
    DiagramNode,
    DiagramEdge,
    ClassDiagramNode,
    UmlDiagramEdge,
    FlowchartDiagramNode,
    FlowchartDiagramEdge,
    FlowchartRelationType,
    FlowchartShape,
    UseCaseRelationType,
    UmlRelationType,
} from './types/diagram';

import type { DiagramType } from './types/diagram';
import { classDiagramConfig } from './diagrams/class/config';
import { flowchartDiagramConfig } from './diagrams/flowchart/config';
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

const initialFlowchartNodes: DiagramNode[] = [
    {
        id: 'flow-start',
        type: 'flowchartNode',
        position: { x: 100, y: 120 },
        data: { shape: 'startEnd', label: '시작' },
    },
    {
        id: 'flow-process',
        type: 'flowchartNode',
        position: { x: 340, y: 120 },
        data: { shape: 'process', label: '처리' },
    },
    {
        id: 'flow-end',
        type: 'flowchartNode',
        position: { x: 580, y: 120 },
        data: { shape: 'startEnd', label: '종료' },
    },
];

const initialFlowchartEdges: DiagramEdge[] = [
    {
        id: 'flow-start-process',
        source: 'flow-start',
        target: 'flow-process',
        type: 'flowchartEdge',
        data: { relationType: 'flow' },
    },
    {
        id: 'flow-process-end',
        source: 'flow-process',
        target: 'flow-end',
        type: 'flowchartEdge',
        data: { relationType: 'flow' },
    },
];

type DiagramRelationType =
    | UmlRelationType
    | FlowchartRelationType
    | UseCaseRelationType;

function isFlowchartEdge(edge: DiagramEdge): edge is FlowchartDiagramEdge {
    return edge.type === 'flowchartEdge';
}

function App() {
    const [diagramType, setDiagramType] = useState<DiagramType>(
        classDiagramConfig.diagramType
    );

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
        useState<DiagramRelationType>('association');

    // 편집 중인 노드 ID
    const [editingNodeId, setEditingNodeId] =
        useState<string | null>(null);

    const editingNode = nodes.find(
        (node) => node.id === editingNodeId
    );

    // 클래스 관계선 편집 상태
    const [editingEdgeId, setEditingEdgeId] =
        useState<string | null>(null);

    const editingEdge = edges.find(
        (edge) => edge.id === editingEdgeId
    );

    const handleEdgeDoubleClick: EdgeMouseHandler<DiagramEdge> = (
        _event,
        edge
    ) => {
        if (edge.type !== 'umlEdge') return;
        setEditingNodeId(null);
        setEditingEdgeId(edge.id);
    };

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
            if (diagramType === 'FLOWCHART') {
                const flowRelation: FlowchartRelationType =
                    relationType === 'yes' || relationType === 'no' || relationType === 'flow'
                        ? relationType
                        : 'flow';
                const newEdge: FlowchartDiagramEdge = {
                    id: crypto.randomUUID(),
                    source: connection.source,
                    sourceHandle: connection.sourceHandle,
                    target: connection.target,
                    targetHandle: connection.targetHandle,
                    type: 'flowchartEdge',
                    data: { relationType: flowRelation },
                };
                setEdges((current) => [...current, newEdge]);
                return;
            }

            // 기존 클래스 다이어그램의 관계 종류를 모두 보존
            const umlRelation: UmlRelationType =
                relationType === 'generalization' ||
                relationType === 'aggregation' ||
                relationType === 'composition' ||
                relationType === 'dependency'
                    ? relationType
                    : 'association';
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
                    relationType: umlRelation,
                },
            };

            // UML의 의미가 맞는지 검사하지 않고 추가
            setEdges((current) => [...current, newEdge]);
        },
        [setEdges, relationType, diagramType]
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

    const addFlowchartNode = (shape: FlowchartShape) => {
        setNodes((current) => {
            const flowchartNodes = current.filter(
                (node) => node.type === 'flowchartNode'
            );
            const newNode: FlowchartDiagramNode = {
                id: crypto.randomUUID(),
                type: 'flowchartNode',
                position: {
                    x: 160 + (flowchartNodes.length % 3) * 210,
                    y: 100 + Math.floor(flowchartNodes.length / 3) * 140,
                },
                data: {
                    shape,
                    label: flowchartDiagramConfig.tools.nodes.find(
                        (tool) => tool.type === shape
                    )?.label ?? '새 도형',
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

    const handleSaveNode = (updatedNode: DiagramNode) => {
        setNodes((current) =>
            current.map((node) =>
                node.id === updatedNode.id &&
                node.type === updatedNode.type
                    ? updatedNode
                    : node
            )
        );

        setEditingNodeId(null);
    };


    // 기존 클래스 UML 관계선 편집 저장
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

                if (isFlowchartEdge(edge)) {
                    const flowRelation: FlowchartRelationType =
                        relationType === 'yes' || relationType === 'no' || relationType === 'flow'
                            ? relationType
                            : 'flow';
                    return {
                        ...edge,
                        data: { ...edge.data, relationType: flowRelation },
                    };
                }

                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        relationType:
                            relationType === 'generalization' ||
                            relationType === 'aggregation' ||
                            relationType === 'composition' ||
                            relationType === 'dependency'
                                ? relationType
                                : 'association',
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
    const resetDiagram = (type: DiagramType = diagramType) => {
        setEditingNodeId(null);
        setEditingEdgeId(null);
        if (type === 'FLOWCHART') {
            setRelationType('flow');
            setNodes(structuredClone(initialFlowchartNodes));
            setEdges(structuredClone(initialFlowchartEdges));
        } else {
            setRelationType('association');
            setNodes(structuredClone(initialNodes));
            setEdges(structuredClone(initialEdges));
        }
    };

    const changeDiagramType = (type: DiagramType) => {
        setDiagramType(type);
        resetDiagram(type);
    };

    // class 브랜치에 있던 AI 분석 기능 유지
    const [diagramPurpose, setDiagramPurpose] =
        useState('쇼핑몰 주문 시스템');
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
                onReset={() => resetDiagram()}
                diagramType={diagramType}
                onDiagramTypeChange={changeDiagramType}
                onAnalyze={runAiAnalysis}
                analyzing={aiLoading}
            />

            <div className="editor-layout">
                <ShapeSidebar
                    diagramType={diagramType}
                    onAddClass={addClass}
                    onAddFlowchartNode={addFlowchartNode}
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
                    enableDelete={editingNodeId === null && editingEdgeId === null}
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
