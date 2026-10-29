
import { useEffect } from 'react';

import type {
    DiagramNode,
    ClassDiagramNode,
} from '../../types/diagram';

import ClassEditForm from '../../diagrams/class/ClassEditForm.tsx';

import './NodeEditModal.css';

type Props = {
    node: DiagramNode;
    onSave: (updatedNode: DiagramNode) => void;
    onClose: () => void;
};

function NodeEditModal({
                           node,
                           onSave,
                           onClose,
                       }: Props) {

    // ESC 키를 누르면 팝업 닫기
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [onClose]);

    // 노드 종류에 따라 편집 폼 선택
    const renderEditForm = () => {
        switch (node.type) {
            case 'classNode': {
                const classNode = node as ClassDiagramNode;

                return (
                    <ClassEditForm
                        node={classNode}
                        onSave={onSave}
                        onCancel={onClose}
                    />
                );
            }

            // 추후 추가할 노드 종류
            // case 'flowchartNode':
            //   return <FlowchartEditForm ... />;

            // case 'useCaseNode':
            //   return <UseCaseEditForm ... />;

            default:
                return (
                    <p>지원하지 않는 노드 유형입니다.</p>
                );
        }
    };

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
                    <h2 id="node-edit-title">
                        노드 편집
                    </h2>

                    <button
                        type="button"
                        className="node-edit-close"
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        ×
                    </button>
                </div>

                {renderEditForm()}
            </div>
        </div>
    );
}

export default NodeEditModal;
