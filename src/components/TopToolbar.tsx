
type Props = {
    onReset: () => void;
};

function TopToolbar({ onReset }: Props) {
    return (
        <header className="top-toolbar">
            <div className="toolbar-left">
                <strong>AI Diagram Editor</strong>
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
