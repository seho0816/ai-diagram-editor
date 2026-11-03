import { useState, type SubmitEvent } from 'react';
import type { FlowchartDiagramNode } from './types';

type Props = {
    node: FlowchartDiagramNode;
    onSave: (updatedNode: FlowchartDiagramNode) => void;
    onCancel: () => void;
};

function FlowchartEditForm({ node, onSave, onCancel }: Props) {
    const [label, setLabel] = useState(node.data.label);

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedLabel = label.trim();
        if (!trimmedLabel) return;

        onSave({
            ...node,
            data: { ...node.data, label: trimmedLabel },
        });
    };

    const shapeLabels = {
        startEnd: '시작 / 종료',
        process: '처리',
        decision: '조건',
        inputOutput: '입력 / 출력',
    } as const;

    return (
        <form className="node-edit-form" onSubmit={handleSubmit}>
            <div className="node-edit-field">
                <label htmlFor="flowchart-shape">노드 종류</label>
                <input id="flowchart-shape" value={shapeLabels[node.data.shape]} readOnly />
            </div>
            <div className="node-edit-field">
                <label htmlFor="flowchart-label">표시 내용</label>
                <textarea
                    id="flowchart-label"
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="노드에 표시할 내용을 입력하세요."
                    rows={3}
                    required
                    autoFocus
                />
            </div>
            <div className="node-edit-actions">
                <button type="button" className="node-edit-cancel" onClick={onCancel}>취소</button>
                <button type="submit" className="node-edit-save" disabled={!label.trim()}>저장</button>
            </div>
        </form>
    );
}

export default FlowchartEditForm;
