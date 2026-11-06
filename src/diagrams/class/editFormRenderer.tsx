import type { ReactNode } from 'react';
import type { DiagramNode } from '../../types/diagram';
import ClassEditForm from './ClassEditForm';

// classNode의 폼 연결은 클래스 폴더에서 관리한다.
export function renderClassEditForm(
  node: DiagramNode,
  onSave: (updatedNode: DiagramNode) => void,
  onCancel: () => void
): ReactNode {
  if (node.type !== 'classNode') return null;

  return (
    <ClassEditForm
      node={node}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
