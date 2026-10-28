
import { useState, type SubmitEvent } from 'react';

import type {
    ClassDiagramNode,
} from './types.ts';

type Props = {
    node: ClassDiagramNode;
    onSave: (updatedNode: ClassDiagramNode) => void;
    onCancel: () => void;
};

// 여러 줄의 텍스트를 문자열 배열로 변환
function parseLines(text: string): string[] {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function ClassEditForm({
                           node,
                           onSave,
                           onCancel,
                       }: Props) {
    const [className, setClassName] = useState(
        node.data.className
    );

    const [attributes, setAttributes] = useState(
        node.data.attributes.join('\n')
    );

    const [methods, setMethods] = useState(
        node.data.methods.join('\n')
    );

    // 수정 사항 저장
    const handleSubmit = (
        event: SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedName = className.trim();

        if (!trimmedName) {
            return;
        }

        const updatedNode: ClassDiagramNode = {
            ...node,
            data: {
                ...node.data,
                className: trimmedName,
                attributes: parseLines(attributes),
                methods: parseLines(methods),
            },
        };

        onSave(updatedNode);
    };

    return (
        <form
            className="node-edit-form"
            onSubmit={handleSubmit}
        >
            <div className="node-edit-field">
                <label htmlFor="class-name">
                    클래스 이름
                </label>

                <input
                    id="class-name"
                    type="text"
                    value={className}
                    onChange={(event) =>
                        setClassName(event.target.value)
                    }
                    placeholder="예: User"
                    required
                    autoFocus
                />
            </div>

            <div className="node-edit-field">
                <label htmlFor="class-attributes">
                    속성
                </label>

                <textarea
                    id="class-attributes"
                    value={attributes}
                    onChange={(event) =>
                        setAttributes(event.target.value)
                    }
                    placeholder={
                        '- userId: Long\n- name: String'
                    }
                    rows={5}
                />

                <small>
                    속성을 한 줄에 하나씩 입력하세요.
                </small>
            </div>

            <div className="node-edit-field">
                <label htmlFor="class-methods">
                    메서드
                </label>

                <textarea
                    id="class-methods"
                    value={methods}
                    onChange={(event) =>
                        setMethods(event.target.value)
                    }
                    placeholder={
                        '+ login(): boolean\n+ logout(): void'
                    }
                    rows={5}
                />

                <small>
                    메서드를 한 줄에 하나씩 입력하세요.
                </small>
            </div>

            <div className="node-edit-actions">
                <button
                    type="button"
                    className="node-edit-cancel"
                    onClick={onCancel}
                >
                    취소
                </button>

                <button
                    type="submit"
                    className="node-edit-save"
                    disabled={!className.trim()}
                >
                    저장
                </button>
            </div>
        </form>
    );
}

export default ClassEditForm;
