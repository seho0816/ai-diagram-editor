import type { DragEvent } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    ConnectionLineType,
    ConnectionMode,
    useReactFlow,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type NodeMouseHandler,
    type EdgeMouseHandler,
} from '@xyflow/react';

import type {
    DiagramNode,
    DiagramEdge,
} from '../types/diagram';
import { nodeTypes, edgeTypes } from '../diagrams/renderRegistry';
import '@xyflow/react/dist/style.css';

type Props = {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    onNodesChange: OnNodesChange<DiagramNode>;
    onEdgesChange: OnEdgesChange<DiagramEdge>;
    onConnect: OnConnect;
    onNodeDoubleClick: NodeMouseHandler<DiagramNode>;
    onEdgeDoubleClick: EdgeMouseHandler<DiagramEdge>;
    enableDelete: boolean;
    readOnly?: boolean;
    // main의 팔레트 드래그 기능. AI 미리보기에서는 전달하지 않아도 된다.
    onDropNode?: (toolType: string, position: { x: number; y: number }) => void;
};

function DiagramCanvasInner({
                                nodes,
                                edges,
                                onNodesChange,
                                onEdgesChange,
                                onConnect,
                                onNodeDoubleClick,
                                onEdgeDoubleClick,
                                enableDelete,
                                readOnly = false,
                                onDropNode,
                            }: Props) {
    const { screenToFlowPosition } = useReactFlow();

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (readOnly || !onDropNode) return;

        const toolType = event.dataTransfer.getData('application/reactflow');
        if (!toolType) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        onDropNode(toolType, position);
    };

    const canDrop = !readOnly && Boolean(onDropNode);

    return (
        <main className="diagram-canvas">
            <ReactFlow<DiagramNode, DiagramEdge>
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={readOnly ? () => {} : onNodesChange}
                onEdgesChange={readOnly ? () => {} : onEdgesChange}
                onConnect={readOnly ? () => {} : onConnect}
                onNodeDoubleClick={readOnly ? undefined : onNodeDoubleClick}
                onEdgeDoubleClick={readOnly ? undefined : onEdgeDoubleClick}
                onDragOver={canDrop ? handleDragOver : undefined}
                onDrop={canDrop ? handleDrop : undefined}
                connectionMode={ConnectionMode.Loose}
                connectionLineType={ConnectionLineType.SmoothStep}
                nodesDraggable={!readOnly}
                nodesConnectable={!readOnly}
                elementsSelectable={!readOnly}
                deleteKeyCode={!readOnly && enableDelete ? ['Delete', 'Backspace'] : null}
                edgesReconnectable={false}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </main>
    );
}

function DiagramCanvas(props: Props) {
    return (
        <ReactFlowProvider>
            <DiagramCanvasInner {...props} />
        </ReactFlowProvider>
    );
}

export default DiagramCanvas;
