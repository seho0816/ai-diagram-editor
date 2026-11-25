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
import { createClassExample, type ClassExampleId } from './diagrams/class/classExamples';
import AiPanel from './components/AiPanel';
import { analyzeDiagram } from './api/ai';
import type { AiAnalysisResult } from './types/ai';
import { useAiEditPreview } from './ai/useAiEditPreview';
import { buildPreviewDiff } from './ai/buildPreviewDiff';
import UmlEdgeEditModal from './diagrams/class/UmlEdgeEditModal';
import type { UmlEdgeData } from './diagrams/class/types';

import TopToolbar from './components/TopToolbar';
import ShapeSidebar from './components/ShapeSidebar';
import DiagramCanvas from './components/DiagramCanvas';
import NodeEditModal from './components/editor/NodeEditModal';
import {
    exportDiagramJson,
    loadDiagramLocally,
    MAX_DIAGRAM_FILE_SIZE,
    parseDiagramDocument,
    saveDiagramLocally,
    type DiagramDocument,
} from './persistence/diagramStorage';

import './App.css';
import './ai/previewDiff.css';
import { FlowchartFeatureProvider } from './diagrams/flowchart/FlowchartFeatures';
import FlowchartSimulationPanel from './diagrams/flowchart/FlowchartSimulationPanel';

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
    const [classExampleRevision, setClassExampleRevision] = useState(0);
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
        if (edge.type !== 'classUmlEdge') return;
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

    // 사이드바 클릭은 기존 위치에, 팔레트 드롭은 사용자가 놓은 좌표에 생성한다.
    const addNode = (
        type: DiagramType,
        toolType: string,
        position?: { x: number; y: number }
    ) => {
        setNodes((current) => {
            const newNode = diagramRegistry[type].createNode(toolType, current);
            if (!newNode) return current;
            return [...current, position ? { ...newNode, position } : newNode];
        });
    };

    // ===== 2026-11-12 추가 (유스케이스 템플릿용, 이규찬) =====
    const loadTemplate = (templateNodes: DiagramNode[], templateEdges: DiagramEdge[]) => {
        setEditingNodeId(null);
        setEditingEdgeId(null);
        analysisRequestId.current += 1;
        setAiLoading(false);
        setAiResult(null);
        setAiError(null);
        setAnalysisSnapshot(null);
        setShowEditPreview(false);
        aiEdits.cancel();
        setNodes(structuredClone(templateNodes));
        setEdges(structuredClone(templateEdges));
    };
    // ===== 2026-11-12 추가 끝 =====

    // ===== 2026-11-18 추가: 유스케이스 자동 정렬용 (이규찬) =====
    const applyAutoLayout = (
        layout: (nodes: DiagramNode[], edges: DiagramEdge[]) => DiagramNode[]
    ) => {
        setNodes((current) => layout(current, edges));
    };
    // ===== 2026-11-18 추가 끝 =====

    // ===== 2026-11-18 추가: 관계선 방향 반전용 (이규찬) =====
    const reverseSelectedEdges = () => {
        setEdges((current) =>
            current.map((edge) =>
                edge.selected
                    ? {
                        ...edge,
                        source: edge.target,
                        target: edge.source,
                        sourceHandle: edge.targetHandle,
                        targetHandle: edge.sourceHandle,
                    }
                    : edge
            )
        );
    };
    // ===== 2026-11-18 추가 끝 =====

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
                edge.id === edgeId && edge.type === 'classUmlEdge'
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
        if (aiPanelOpen) return; // AI 분석 화면에서는 다이어그램 종류를 전환하지 않는다.
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
    const [canvasInstance, setCanvasInstance] = useState(0);

    const aiEdits = useAiEditPreview({
        diagramType,
        purpose: diagramPurpose,
        nodes, edges, setNodes, setEdges,
    });

    // Save only the actual editor graph; AI previews have not been approved yet.
    const handleSaveDiagram = () => {
        try {
            saveDiagramLocally({
                diagramType,
                nodes,
                edges,
                purpose: diagramPurpose,
            });
            window.alert('현재 다이어그램을 저장했습니다.');
        } catch (error) {
            window.alert(error instanceof Error ? error.message : '저장에 실패했습니다.');
        }
    };

    // Both local load and JSON import must restore the same editor state.
    const restoreDiagram = (saved: DiagramDocument) => {
        analysisRequestId.current += 1;
        aiEdits.cancel();
        setAiPanelOpen(false);
        setAiLoading(false);
        setAiError(null);
        setAiResult(null);
        setAnalysisSnapshot(null);
        setShowEditPreview(false);
        setEditingNodeId(null);
        setEditingEdgeId(null);
        setDiagramType(saved.diagramType);
        setRelationType(diagramRegistry[saved.diagramType].defaultRelationType);
        setNodes(structuredClone(saved.nodes));
        setEdges(structuredClone(saved.edges));
        setDiagramPurpose(saved.purpose);
        setCanvasInstance((current) => current + 1);
    };

    const handleLoadDiagram = () => {
        try {
            const saved = loadDiagramLocally(diagramType);
            if (!saved) {
                window.alert('현재 다이어그램 종류에 저장된 내용이 없습니다.');
                return;
            }
            if (!window.confirm('현재 작업을 저장된 다이어그램으로 교체할까요? 저장하지 않은 변경은 사라집니다.')) {
                return;
            }
            restoreDiagram(saved);
            window.alert('저장된 다이어그램을 불러왔습니다.');
        } catch (error) {
            window.alert(error instanceof Error ? error.message : '불러오기에 실패했습니다.');
        }
    };

    const handleExportJson = () => {
        try {
            exportDiagramJson({ diagramType, nodes, edges, purpose: diagramPurpose });
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'JSON 내보내기에 실패했습니다.');
        }
    };

    const handleImportJson = async (file: File) => {
        try {
            if (file.size > MAX_DIAGRAM_FILE_SIZE) {
                throw new Error('5MB 이하의 JSON 파일만 가져올 수 있습니다.');
            }
            const saved = parseDiagramDocument(await file.text());
            const switchWarning = saved.diagramType !== diagramType
                ? '파일에 저장된 다이어그램 종류로 전환됩니다.\n'
                : '';
            if (!window.confirm(`${switchWarning}현재 작업을 JSON 파일의 내용으로 교체할까요? 저장하지 않은 변경은 사라집니다.`)) {
                return;
            }
            restoreDiagram(saved);
            window.alert('JSON 파일을 가져왔습니다. 브라우저에 따로 저장하려면 저장 버튼을 누르세요.');
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'JSON 가져오기에 실패했습니다.');
        }
    };

    const loadClassExample = (exampleId: ClassExampleId) => {
        if (diagramType !== 'CLASS') return;
        const edgeType = diagramRegistry.CLASS.initialEdges[0]?.type ?? 'umlEdge';
        const example = createClassExample(exampleId, edgeType);
        if (!window.confirm(
            `현재 캔버스 내용이 사라집니다.\n저장하지 않은 변경 사항도 사라집니다.\n\n'${example.info.title}' 사례를 불러오시겠습니까?`
        )) return;

        // 이미 실행 중이던 AI 결과가 새 사례를 덮지 않도록 무효화한다.
        analysisRequestId.current += 1;
        aiEdits.cancel();
        setAiLoading(false);
        setAiResult(null);
        setAiError(null);
        setAnalysisSnapshot(null);
        setShowEditPreview(false);
        setEditingNodeId(null);
        setEditingEdgeId(null);
        setRelationType(diagramRegistry.CLASS.defaultRelationType);
        setDiagramPurpose(example.info.purpose);
        setNodes(example.nodes);
        setEdges(example.edges);
        // React Flow의 fitView를 새 그래프에 대해 다시 수행한다.
        setClassExampleRevision((current) => current + 1);
    };


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

    const handleClarificationAnswer = (
        issue: Parameters<typeof aiEdits.propose>[0], index: number, answer: string
    ) => {
        setShowEditPreview(false);
        void aiEdits.propose(issue, index, answer);
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

    const openAiAnalysisPanel = () => {
        // 캔버스의 최신 상태를 AI 분석 진입 시점에 즉시 고정한다.
        analysisRequestId.current += 1;
        aiEdits.cancel();
        setAiLoading(false);
        setAiResult(null);
        setAiError(null);
        setShowEditPreview(false);
        setAnalysisSnapshot({
            nodes: structuredClone(nodes),
            edges: structuredClone(edges),
        });
        setAiPanelOpen(true);
    };

    const visiblePreview = showEditPreview ? aiEdits.preview : null;
    const previewDiff = visiblePreview
        ? buildPreviewDiff(
            (analysisSnapshot ?? { nodes, edges }).nodes,
            (analysisSnapshot ?? { nodes, edges }).edges,
            visiblePreview.nodes,
            visiblePreview.edges
          )
        : null;
    const visibleGraph = previewDiff ?? analysisSnapshot ?? { nodes, edges };

    return (
        <div className="app">
            <TopToolbar
                onReset={() => resetDiagram()}
                diagramType={diagramType}
                onDiagramTypeChange={changeDiagramType}
                analysisModeLocked={aiPanelOpen}
                onAnalyze={openAiAnalysisPanel}
                analyzing={aiLoading}
                onSave={handleSaveDiagram}
                onLoad={handleLoadDiagram}
                onExportJson={handleExportJson}
                onImportJson={(file) => { void handleImportJson(file); }}
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
                        editClarification={aiEdits.clarification}
                        onAnswerClarification={handleClarificationAnswer}
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
                                    : analysisSnapshot ? 'AI 분석 기준 다이어그램' : '현재 다이어그램'}
                            </strong>
                            <span>
                {visiblePreview
                    ? '승인하기 전까지 실제 다이어그램은 바뀌지 않습니다.'
                    : analysisSnapshot
                        ? 'AI 분석 화면을 연 시점의 다이어그램입니다.'
                        : 'AI 분석을 실행하면 현재 다이어그램이 기준으로 보관됩니다.'}
              </span>
                        </div>
                        {previewDiff && (
                            <div className="ai-diff-legend" role="status" aria-label="AI 수정 변경 사항">
                                <span className="ai-diff-summary">
                                    노드 추가 {previewDiff.nodeCount.added} · 변경 {previewDiff.nodeCount.changed} · 제거 {previewDiff.nodeCount.removed}
                                    {' / '}관계선 추가 {previewDiff.edgeCount.added} · 변경 {previewDiff.edgeCount.changed} · 제거 {previewDiff.edgeCount.removed}
                                </span>
                                <span className="ai-diff-key ai-diff-key--added">추가</span>
                                <span className="ai-diff-key ai-diff-key--changed">변경</span>
                                <span className="ai-diff-key ai-diff-key--removed">제거 예정(빨간 점선)</span>
                            </div>
                        )}
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
                <FlowchartFeatureProvider
                    nodes={nodes}
                    edges={edges}
                    onArrange={(arrangedNodes, arrangedEdges) => {
                        setNodes(arrangedNodes);
                        setEdges(arrangedEdges);
                    }}
                >
                <div className="editor-layout">
                    <ShapeSidebar
                        diagramType={diagramType}
                        onAddNode={addNode}
                        onLoadClassExample={loadClassExample}
                        relationType={relationType}
                        onSelectRelationType={setRelationType}
                        onApplyRelationToSelected={applyRelationToSelected}
                        onDeleteSelected={deleteSelected}
                        hasSelectedEdge={hasSelectedEdge}
                        hasSelection={hasSelection}
                        onLoadTemplate={loadTemplate} // ===== 2026-11-12 추가 (템플릿) =====
                        onAutoLayout={applyAutoLayout} // ===== 2026-11-18 추가 (자동 정렬) =====
                        onReverseEdge={reverseSelectedEdges} // ===== 2026-11-18 추가 (관계선 방향 반전) =====
                    />
                    <div className="flowchart-canvas-host">
                    <DiagramCanvas
                        key={[(canvasInstance), classExampleRevision].join(':')}
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
                    {diagramType === 'FLOWCHART' && <FlowchartSimulationPanel />}
                    </div>
                </div>
                </FlowchartFeatureProvider>
            )}

            {editingNode && (
                <NodeEditModal
                    key={editingNode.id}
                    node={editingNode}
                    onSave={handleSaveNode}
                    onClose={closeEditModal}
                />
            )}
            {editingEdge && editingEdge.type === 'classUmlEdge' && (
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