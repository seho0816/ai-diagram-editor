
import type { DiagramType } from '../types/diagram';

type Props = {
    onReset: () => void;
    onAnalyze: () => void;
    analyzing: boolean;
    diagramType: DiagramType;
    onDiagramTypeChange: (diagramType: DiagramType) => void;
};

function TopToolbar({
                        onReset,
                        onAnalyze,
                        analyzing,
                        diagramType,
                        onDiagramTypeChange,
                    }: Props) {
    return (
        <header className="top-toolbar">
            <div className="toolbar-left">
                <strong>AI Diagram Editor</strong>
                <div className="diagram-mode-selector" role="group" aria-label="다이어그램 종류">
                    <span className="diagram-mode-title">다이어그램</span>
                    <div className="diagram-mode-options">
                        <button type="button" className={`diagram-mode-button ${diagramType === 'CLASS' ? 'selected' : ''}`} aria-pressed={diagramType === 'CLASS'} onClick={() => onDiagramTypeChange('CLASS')}>클래스</button>
                        <button type="button" className={`diagram-mode-button ${diagramType === 'FLOWCHART' ? 'selected' : ''}`} aria-pressed={diagramType === 'FLOWCHART'} onClick={() => onDiagramTypeChange('FLOWCHART')}>플로우차트</button>
                    </div>
                </div>
                <button onClick={onReset}>초기화</button>
            </div>

            <div className="toolbar-right">
                <button disabled>저장</button>
                <button
                    type="button"
                    onClick={onAnalyze}
                    disabled={analyzing}
                >
                    {analyzing ? '분석 중...' : 'AI 분석'}
                </button>
            </div>
        </header>
    );
}

export default TopToolbar;
