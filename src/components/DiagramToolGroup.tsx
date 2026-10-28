
import type { ReactNode } from 'react';

type Props = {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children?: ReactNode;
};

function DiagramToolGroup({
                              title,
                              isOpen,
                              onToggle,
                              children,
                          }: Props) {
    return (
        <section className="diagram-tool-group">
            <button
                type="button"
                className="diagram-tool-header"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
        <span aria-hidden="true">
          {isOpen ? '▼' : '▶'}
        </span>
                {title}
            </button>

            {isOpen && children != null && (
                <div className="diagram-tool-content">
                    {children}
                </div>
            )}
        </section>
    );
}

export default DiagramToolGroup;
