import type { Connection } from '@xyflow/react';
import type {
  DiagramNode,
  DiagramEdge,
  FlowchartDiagramNode,
  FlowchartDiagramEdge,
  FlowchartRelationType,
  FlowchartShape,
} from '../../types/diagram';
import { flowchartDiagramConfig } from './config';
import type { DiagramRelationType } from '../toolPanelTypes';
import type { DiagramModule } from '../diagramModule';

const initialNodes: DiagramNode[] = [
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

const initialEdges: DiagramEdge[] = [
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

function normalizeRelation(type: DiagramRelationType): FlowchartRelationType {
  return type === 'yes' || type === 'no' || type === 'flow'
    ? type
    : 'flow';
}

function createNode(toolType: string, currentNodes: DiagramNode[]): FlowchartDiagramNode {
  const shape = toolType as FlowchartShape;
  const flowchartNodes = currentNodes.filter((node) => node.type === 'flowchartNode');
  return {
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
}

function createEdge(connection: Connection, type: DiagramRelationType): FlowchartDiagramEdge {
  return {
    id: crypto.randomUUID(),
    source: connection.source,
    sourceHandle: connection.sourceHandle,
    target: connection.target,
    targetHandle: connection.targetHandle,
    type: 'flowchartEdge',
    data: { relationType: normalizeRelation(type) },
  };
}

export function updateFlowchartEdgeRelation(
  edge: DiagramEdge,
  type: DiagramRelationType
): DiagramEdge {
  if (edge.type !== 'flowchartEdge') return edge;
  return {
    ...edge,
    data: { ...edge.data, relationType: normalizeRelation(type) },
  };
}

export const flowchartDiagramActions: DiagramModule = {
  initialNodes,
  initialEdges,
  defaultRelationType: 'flow',
  createNode,
  createEdge,
};
