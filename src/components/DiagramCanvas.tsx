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
  enableDelete: boolean;
  readOnly?: boolean;
  onEdgeDoubleClick: EdgeMouseHandler<DiagramEdge>;
};

function DiagramCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDoubleClick,
  onEdgeDoubleClick,
  enableDelete,
  readOnly = false,
}: Props) {
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

export default DiagramCanvas;
