
import { useEffect, useState } from 'react';

import type {
    UmlDiagramEdge,
    UmlEdgeData,
    UmlRelationType,
} from './types';

import { classDiagramConfig } from './config';
import '../../components/editor/NodeEditModal.css';

type Props = {
    edge: UmlDiagramEdge;
    onSave: (edgeId: string, data: UmlEdgeData) => void;
    onClose: () => void;
};

function UmlEdgeEditModal({
                              edge,
                              onSave,
                              onClose,
                          }: Props) {
    const [relationType, setRelationType] =
        useState<UmlRelationType>(
            edge.data?.relationType ?? 'association'
        );

    const [sourceMultiplicity, setSourceMultiplicity] =
        useState(edge.data?.sourceMultiplicity ?? '');

    const [targetMultiplicity, setTargetMultiplicity] =
        useState(edge.data?.targetMultiplicity ?? '');

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
                aria-labelledby="edge-edit-title"
            >
                <div className="node-edit-header">
                    <h2 id="edge-edit-title">관계선 편집</h2>

                    <button
                        type="button"
                        className="node-edit-close"
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        ×
                    </button>
                </div>

                <form
                    className="node-edit-form"
                    onSubmit={(event) => {
                        event.preventDefault();

                        onSave(edge.id, {
                            relationType,
                            sourceMultiplicity:
                                sourceMultiplicity.trim(),
                            targetMultiplicity:
                                targetMultiplicity.trim(),
                        });
                    }}
                >
                    <div className="node-edit-field">
                        <label htmlFor="relation-type">
                            관계 종류
                        </label>

                        <select
                            id="relation-type"
                            value={relationType}
                            onChange={(event) =>
                                setRelationType(
                                    event.target.value as UmlRelationType
                                )
                            }
                        >
                            {classDiagramConfig.tools.relations.map(
                                (tool) => (
                                    <option
                                        key={tool.type}
                                        value={tool.type}
                                    >
                                        {tool.label}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="node-edit-field">
                        <label htmlFor="source-multiplicity">
                            시작 클래스 쪽 다중성
                        </label>

                        <input
                            id="source-multiplicity"
                            type="text"
                            value={sourceMultiplicity}
                            onChange={(event) =>
                                setSourceMultiplicity(event.target.value)
                            }
                            placeholder="예: 1"
                        />
                    </div>

                    <div className="node-edit-field">
                        <label htmlFor="target-multiplicity">
                            도착 클래스 쪽 다중성
                        </label>

                        <input
                            id="target-multiplicity"
                            type="text"
                            value={targetMultiplicity}
                            onChange={(event) =>
                                setTargetMultiplicity(event.target.value)
                            }
                            placeholder="예: 0..*"
                        />
                    </div>
                    <div className="node-edit-actions">
                        <button
                            type="button"
                            className="node-edit-cancel"
                            onClick={onClose}
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className="node-edit-save"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UmlEdgeEditModal;
