import type { ReactNode } from 'react';
import type { DiagramNode } from '../../types/diagram';
import FlowchartEditForm from './FlowchartEditForm';

// flowchartNode의 폼 연결은 플로우차트 폴더에서 관리한다.
export function renderFlowchartEditForm(
  node: DiagramNode,
  onSave: (updatedNode: DiagramNode) => void,
  onCancel: () => void
): ReactNode {
  if (node.type !== 'flowchartNode') return null;

  return (
    <FlowchartEditForm
      node={node}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
