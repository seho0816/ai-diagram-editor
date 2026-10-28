
import { useState } from 'react';

import DiagramToolGroup from './DiagramToolGroup';

import { classDiagramConfig } from
        '../diagrams/class/config';

import type {
    DiagramType,
    UmlRelationType,
} from '../types/diagram';

type Props = {
    diagramType?: DiagramType;
    onAddClass: () => void;
    relationType: UmlRelationType;
    onSelectRelationType: (type: UmlRelationType) => void;
    onApplyRelationToSelected: () => void;
    onDeleteSelected: () => void;
    hasSelectedEdge: boolean;
    hasSelection: boolean;
};

function ShapeSidebar({
                          diagramType = 'CLASS',
                          onAddClass,
                          relationType,
                          onSelectRelationType,
                          onApplyRelationToSelected,
                          onDeleteSelected,
                          hasSelectedEdge,
                          hasSelection,
                      }: Props) {
    const [expandedGroup, setExpandedGroup] =
        useState<DiagramType | null>(diagramType);

    const toggleGroup = (type: DiagramType) => {
        setExpandedGroup((current) =>
            current === type ? null : type
        );
    };

    return (
        <aside className="shape-sidebar">
            <h3>다이어그램 도구</h3>

            <DiagramToolGroup
                title="클래스"
                isOpen={expandedGroup === 'CLASS'}
                onToggle={() => toggleGroup('CLASS')}
            >
                <div className="tool-section">
                    <h4>도형</h4>
                    <button
                        type="button"
                        className="class-tool"
                        onClick={onAddClass}
                    >
                        <div>ClassName</div>
                        <div>attributes</div>
                        <div>methods()</div>
                    </button>
                </div>

                <div className="tool-section">
                    <h4>관계선</h4>

                    {classDiagramConfig.tools.relations.map(
                        (tool) => (
                            <button
                                key={tool.type}
                                type="button"
                                className={`relation-tool ${
                                    relationType === tool.type
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    onSelectRelationType(tool.type)
                                }
                                aria-pressed={
                                    relationType === tool.type
                                }
                            >
                <span className="relation-symbol">
                  {tool.type === 'association'
                      ? '────'
                      : '──▷'}
                </span>
                                {tool.label}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        className="sidebar-action-button"
                        onClick={onApplyRelationToSelected}
                        disabled={!hasSelectedEdge}
                    >
                        선택한 관계선 종류 변경
                    </button>
                </div>
            </DiagramToolGroup>

            <DiagramToolGroup
                title="유스케이스"
                isOpen={expandedGroup === 'USE_CASE'}
                onToggle={() => toggleGroup('USE_CASE')}
            />

            <DiagramToolGroup
                title="플로우차트"
                isOpen={expandedGroup === 'FLOWCHART'}
                onToggle={() => toggleGroup('FLOWCHART')}
            />

            <div className="tool-section sidebar-edit-section">
                <h4>공통 편집</h4>

                <button
                    type="button"
                    className="sidebar-action-button delete-tool"
                    onClick={onDeleteSelected}
                    disabled={!hasSelection}
                >
                    선택한 요소 삭제
                </button>
            </div>
        </aside>
    );
}

export default ShapeSidebar;
