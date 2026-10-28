
import type {
    UmlRelationType,
} from '../types/diagram';

type Props = {
    onAddClass: () => void;

    relationType: UmlRelationType;
    onSelectRelationType: (
        type: UmlRelationType
    ) => void;

    onApplyRelationToSelected: () => void;
    onDeleteSelected: () => void;

    hasSelectedEdge: boolean;
    hasSelection: boolean;
};

function ShapeSidebar({
                          onAddClass,
                          relationType,
                          onSelectRelationType,
                          onApplyRelationToSelected,
                          onDeleteSelected,
                          hasSelectedEdge,
                          hasSelection,
                      }: Props) {
    return (
        <aside className="shape-sidebar">
            <h3>다이어그램 도구</h3>

            {/* 클래스 생성 */}
            <div className="tool-section">
                <h4>클래스</h4>

                <button
                    type="button"
                    className="class-tool"
                    onClick={onAddClass}
                >
                    <div>ClassName</div>
                    <div>attributes</div>
                    <div>methods()</div>
                </button>

                <p>클릭하여 클래스 추가</p>
            </div>

            {/* 관계선 종류 선택 */}
            <div className="tool-section">
                <h4>관계선</h4>

                <button
                    type="button"
                    className={`relation-tool ${
                        relationType === 'association'
                            ? 'active'
                            : ''
                    }`}
                    aria-pressed={
                        relationType === 'association'
                    }
                    onClick={() =>
                        onSelectRelationType('association')
                    }
                >
          <span className="relation-symbol">
            ─────
          </span>
                    <span>연관</span>
                </button>

                <button
                    type="button"
                    className={`relation-tool ${
                        relationType === 'generalization'
                            ? 'active'
                            : ''
                    }`}
                    aria-pressed={
                        relationType === 'generalization'
                    }
                    onClick={() =>
                        onSelectRelationType('generalization')
                    }
                >
          <span className="relation-symbol">
            ───▷
          </span>
                    <span>상속</span>
                </button>

                <p>
                    관계 종류를 선택한 뒤
                    노드의 연결점을 드래그하세요.
                </p>

                <button
                    type="button"
                    className="sidebar-action-button"
                    onClick={onApplyRelationToSelected}
                    disabled={!hasSelectedEdge}
                >
                    선택한 관계선 종류 변경
                </button>
            </div>

            {/* 요소 삭제 */}
            <div className="tool-section">
                <h4>편집</h4>

                <button
                    type="button"
                    className="sidebar-action-button delete-tool"
                    onClick={onDeleteSelected}
                    disabled={!hasSelection}
                >
                    선택한 요소 삭제
                </button>

                <p>Delete / Backspace 사용 가능</p>
            </div>
        </aside>
    );
}

export default ShapeSidebar;
