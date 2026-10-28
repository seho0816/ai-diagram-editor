
import {
    ReactFlow,
    Background,
    Controls,
    ConnectionLineType,
    ConnectionMode,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type NodeMouseHandler,
} from '@xyflow/react';

import type {
    DiagramNode,
    DiagramEdge,
} from '../types/diagram';

import '@xyflow/react/dist/style.css';

import {
    classDiagramConfig,
} from '../diagrams/class/config';

const nodeTypes = classDiagramConfig.nodeTypes;
const edgeTypes = classDiagramConfig.edgeTypes;

type Props = {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    onNodesChange: OnNodesChange<DiagramNode>;
    onEdgesChange: OnEdgesChange<DiagramEdge>;
    onConnect: OnConnect;
    onNodeDoubleClick: NodeMouseHandler<DiagramNode>;
    enableDelete: boolean;
};

function DiagramCanvas({
                           nodes,
                           edges,
                           onNodesChange,
                           onEdgesChange,
                           onConnect,
                           onNodeDoubleClick,
                           enableDelete,
                       }: Props) {
    return (
        <main className="diagram-canvas">
            <ReactFlow<DiagramNode, DiagramEdge>
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}

                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={onNodeDoubleClick}

                connectionMode={ConnectionMode.Loose}
                connectionLineType={ConnectionLineType.SmoothStep}

                deleteKeyCode={
                    enableDelete ? ['Delete', 'Backspace'] : null
                }
                edgesReconnectable={false}
                fitView
                >
                <Background />
                <Controls />
            </ReactFlow>
        </main>
    );
}

export default DiagramCanvas;
