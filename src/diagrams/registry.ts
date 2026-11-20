import type { DiagramEdge, DiagramType } from '../types/diagram.ts';
import type { DiagramRelationType } from './toolPanelTypes';
import type { DiagramModule } from './diagramModule.ts';
import { classDiagramActions, updateClassEdgeRelation } from './class/actions';
import { flowchartDiagramActions, updateFlowchartEdgeRelation } from './flowchart/actions';
import { useCaseDiagramActions } from './USE_CASE/actions.ts';

// 각 담당 폴더의 기능을 공통 편집기에 연결하는 유일한 등록 지점
export const diagramRegistry: Record<DiagramType, DiagramModule> = {
  CLASS: classDiagramActions,
  USE_CASE: useCaseDiagramActions,
  FLOWCHART: flowchartDiagramActions,
};

// 기존 App에서 관계선의 type에 따라 처리하던 로직을 그대로 분리함
export function updateEdgeRelation(
  edge: DiagramEdge,
  relationType: DiagramRelationType
): DiagramEdge {
  if (edge.type === 'flowchartEdge') return updateFlowchartEdgeRelation(edge, relationType);
  if (edge.type === 'classUmlEdge') return updateClassEdgeRelation(edge, relationType);
  // USE_CASE intentionally retains the existing 'umlEdge' renderer and data shape.
  if (String(edge.type) === 'umlEdge') {
    const allowed = ['association', 'include', 'extend', 'generalization'];
    return {
      ...edge,
      data: { ...edge.data, relationType: allowed.includes(relationType) ? relationType : 'association' },
    } as DiagramEdge;
  }
  return edge;
}
