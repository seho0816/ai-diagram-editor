import type { Connection } from '@xyflow/react';
import type {
  DiagramNode,
  DiagramEdge,
  ClassDiagramNode,
  UmlDiagramEdge,
  UmlRelationType,
} from '../../types/diagram';
import type { DiagramRelationType } from '../toolPanelTypes';
import type { DiagramModule } from '../diagramModule';

const initialNodes: DiagramNode[] = [
  {
    id: 'user',
    type: 'classNode',
    position: { x: 100, y: 100 },
    data: {
      className: 'User',
      attributes: ['- userId: Long', '- name: String', '- email: String'],
      methods: ['+ login(): boolean', '+ logout(): void'],
    },
  },
  {
    id: 'order',
    type: 'classNode',
    position: { x: 450, y: 150 },
    data: {
      className: 'Order',
      attributes: ['- orderId: Long', '- totalPrice: int'],
      methods: ['+ cancel(): void', '+ calculateTotal(): int'],
    },
  },
];

const initialEdges: DiagramEdge[] = [
  {
    id: 'user-order',
    source: 'user',
    sourceHandle: 'right',
    target: 'order',
    targetHandle: 'left',
    type: 'umlEdge',
    data: { relationType: 'association' },
  },
];

function normalizeRelation(type: DiagramRelationType): UmlRelationType {
  return type === 'generalization' ||
    type === 'aggregation' ||
    type === 'composition' ||
    type === 'dependency'
    ? type
    : 'association';
}

function createNode(_toolType: string, currentNodes: DiagramNode[]): ClassDiagramNode {
  return {
    id: crypto.randomUUID(),
    type: 'classNode',
    position: {
      x: 150 + currentNodes.length * 50,
      y: 100 + currentNodes.length * 40,
    },
    data: {
      className: `Class${currentNodes.length + 1}`,
      attributes: [],
      methods: [],
    },
  };
}

function createEdge(connection: Connection, type: DiagramRelationType): UmlDiagramEdge {
  return {
    id: crypto.randomUUID(),
    source: connection.source,
    sourceHandle: connection.sourceHandle,
    target: connection.target,
    targetHandle: connection.targetHandle,
    type: 'umlEdge',
    data: { relationType: normalizeRelation(type) },
  };
}

export function updateClassEdgeRelation(
  edge: DiagramEdge,
  type: DiagramRelationType
): DiagramEdge {
  if (edge.type !== 'umlEdge') return edge;
  return {
    ...edge,
    data: { ...edge.data, relationType: normalizeRelation(type) },
  };
}

export const classDiagramActions: DiagramModule = {
  initialNodes,
  initialEdges,
  defaultRelationType: 'association',
  createNode,
  createEdge,
};
