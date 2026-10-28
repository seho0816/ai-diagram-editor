import { useState } from 'react';

import DiagramToolGroup from './DiagramToolGroup';

import { classDiagramConfig } from '../diagrams/class/config';
import { useCaseDiagramConfig } from '../diagrams/USE_CASE/config';

import type {
    DiagramType,
    UmlRelationType,
} from '../types/diagram';

type Props = {
    diagramType?: DiagramType;
    onAddClass: () => void;
    onAddActor?: () => void;
    onAddUseCase?: () => void;
    onAddBoundary?: () => void;
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
                          onAddActor,
                          onAddUseCase,
                          onAddBoundary,
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

            {/* 1. 클래스 다이어그램 */}
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

            {/* 2. 유스케이스 다이어그램 */}
            <DiagramToolGroup
                title="유스케이스"
                isOpen={expandedGroup === 'USE_CASE'}
                onToggle={() => toggleGroup('USE_CASE')}
            >
                <div className="tool-section">
                    <h4>도형</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            type="button"
                            className="sidebar-action-button"
                            onClick={onAddActor}
                        >
                            + 액터 추가
                        </button>
                        <button
                            type="button"
                            className="sidebar-action-button"
                            onClick={onAddUseCase}
                        >
                            + 유스케이스 추가
                        </button>
                        <button
                            type="button"
                            className="sidebar-action-button"
                            onClick={onAddBoundary}
                        >
                            + 시스템 경계 추가
                        </button>
                    </div>
                </div>

                <div className="tool-section">
                    <h4>관계선</h4>
                    {useCaseDiagramConfig.tools.relations.map(
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
                                    onSelectRelationType(tool.type as UmlRelationType)
                                }
                                aria-pressed={
                                    relationType === tool.type
                                }
                            >
                                <span className="relation-symbol">
                                  {tool.type === 'association'
                                      ? '────'
                                      : tool.type === 'generalization'
                                          ? '──▷'
                                          : ' - -▷'}
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

            {/* 3. 플로우차트 다이어그램 */}
            <DiagramToolGroup
                title="플로우차트"
                isOpen={expandedGroup === 'FLOWCHART'}
                onToggle={() => toggleGroup('FLOWCHART')}
            />

            {/* 공통 편집 */}
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