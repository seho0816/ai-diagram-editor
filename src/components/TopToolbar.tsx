
type Props = {
    onReset: () => void;
    onAnalyze: () => void;
    analyzing: boolean;
};

function TopToolbar({
                        onReset,
                        onAnalyze,
                        analyzing,
                    }: Props) {
    return (
        <header className="top-toolbar">
            <div className="toolbar-left">
                <strong>AI Diagram Editor</strong>
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
