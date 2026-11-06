import type { Connection } from '@xyflow/react';
import type { DiagramNode, DiagramEdge } from '../types/diagram.ts';
import type { DiagramRelationType } from './toolPanelTypes';

// 각 다이어그램 모듈이 공통 편집기에 제공하는 최소 계약
export interface DiagramModule {
  initialNodes: DiagramNode[];
  initialEdges: DiagramEdge[];
  defaultRelationType: DiagramRelationType;
  createNode: (toolType: string, currentNodes: DiagramNode[]) => DiagramNode | null;
  createEdge: (connection: Connection, relationType: DiagramRelationType) => DiagramEdge;
}
