import type { ReactNode } from 'react';
import type { DiagramNode } from '../types/diagram';
import { renderClassEditForm } from './class/editFormRenderer';
import { renderFlowchartEditForm } from './flowchart/editFormRenderer';

export type NodeEditFormRenderer = (
  node: DiagramNode,
  onSave: (updatedNode: DiagramNode) => void,
  onCancel: () => void
) => ReactNode;

// 편집 폼의 등록 위치를 공통 모달에서 분리한다.
// 기존 프로젝트에서 실제 연결된 classNode, flowchartNode만 유지한다.
const editFormRegistry: Partial<Record<NonNullable<DiagramNode['type']>, NodeEditFormRenderer>> = {
  classNode: renderClassEditForm,
  flowchartNode: renderFlowchartEditForm,
};

export function renderNodeEditForm(
  node: DiagramNode,
  onSave: (updatedNode: DiagramNode) => void,
  onCancel: () => void
): ReactNode {
  const renderer = node.type ? editFormRegistry[node.type] : undefined;

  return renderer
    ? renderer(node, onSave, onCancel)
    : <p>지원하지 않는 노드 유형입니다.</p>;
}
