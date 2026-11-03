
import type { DiagramType } from '../types/diagram';

type Props = {
    onReset: () => void;
    diagramType: DiagramType;
    onDiagramTypeChange: (diagramType: DiagramType) => void;
};

function TopToolbar({ onReset, diagramType, onDiagramTypeChange }: Props) {
    return (
        <header className="top-toolbar">
            <div className="toolbar-left">
                <strong>AI Diagram Editor</strong>
                <label>
                    다이어그램
                    <select
                        aria-label="다이어그램 종류"
                        value={diagramType}
                        onChange={(event) =>
                            onDiagramTypeChange(event.target.value as DiagramType)
                        }
                    >
                        <option value="CLASS">클래스</option>
                        <option value="FLOWCHART">플로우차트</option>
                    </select>
                </label>
                <button onClick={onReset}>초기화</button>
            </div>

            <div className="toolbar-right">
                <button disabled>저장 (준비 중)</button>
                <button disabled>AI 분석 (준비 중)</button>
            </div>
        </header>
    );
}

export default TopToolbar;
