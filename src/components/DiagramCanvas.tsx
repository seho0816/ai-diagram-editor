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
  enableDelete: boolean;
  onEdgeDoubleClick: EdgeMouseHandler<DiagramEdge>;
  // 팔레트에서 드래그해 캔버스에 놓았을 때 호출된다.
  onDropNode: (toolType: string, position: { x: number; y: number }) => void;
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
  onDropNode,
}: Props) {
  const { screenToFlowPosition } = useReactFlow();

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault(); // 이게 없으면 drop 이벤트가 발생하지 않는다
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const toolType = event.dataTransfer.getData('application/reactflow');
    if (!toolType) return; // 팔레트에서 온 드래그가 아니면 무시

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    onDropNode(toolType, position);
  };

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
        onEdgeDoubleClick={onEdgeDoubleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        deleteKeyCode={enableDelete ? ['Delete', 'Backspace'] : null}
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