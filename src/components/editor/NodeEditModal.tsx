import { useEffect } from 'react';
import type { DiagramNode } from '../../types/diagram';
import { renderNodeEditForm } from '../../diagrams/editFormRegistry';
import './NodeEditModal.css';

type Props = {
  node: DiagramNode;
  onSave: (updatedNode: DiagramNode) => void;
  onClose: () => void;
};

function NodeEditModal({ node, onSave, onClose }: Props) {
  // 기존 모달 동작 유지: ESC를 누르면 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="node-edit-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="node-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="node-edit-title"
      >
        <div className="node-edit-header">
          <h2 id="node-edit-title">노드 편집</h2>
          <button
            type="button"
            className="node-edit-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {renderNodeEditForm(node, onSave, onClose)}
      </div>
    </div>
  );
}

export default NodeEditModal;
