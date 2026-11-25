import type { DragEvent } from 'react';
import { classDiagramConfig } from './config';
import { CLASS_EXAMPLES, type ClassExampleId } from './classExamples';
import './ClassExamples.css';
import type { UmlRelationType } from '../../types/diagram';
import type { RelationToolProps } from '../toolPanelTypes';

type Props = Pick<RelationToolProps, 'relationType' | 'onSelectRelationType'> & {
  onAddNode: (toolType: string) => void;
  onLoadExample: (exampleId: ClassExampleId) => void;
};

const relationSymbols: Record<UmlRelationType, string> = {
  association: '────',
  generalization: '──▷',
  aggregation: '──◇',
  composition: '──◆',
  dependency: '┄┄>',
};

function ClassToolPanel({ onAddNode, onLoadExample, relationType, onSelectRelationType }: Props) {
  const onDragStart = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData('application/reactflow', 'class');
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
        <div className="tool-section">
          <h4>도형</h4>
          <button
            type="button"
            className="class-tool"
            onClick={() => onAddNode('class')}
            draggable
            onDragStart={onDragStart}
          >
            <div style={{ fontWeight: 'bold' }}>ClassName</div>
            <div style={{ fontSize: '11px', color: '#666' }}>+ attributes</div>
            <div style={{ fontSize: '11px', color: '#666' }}>+ methods()</div>
          </button>
        </div>

        <div className="tool-section">
          <h4>관계선</h4>
          {classDiagramConfig.tools.relations.map((tool) => (
            <button
              key={tool.type}
              type="button"
              className={`relation-tool ${
                relationType === tool.type ? 'active' : ''
              }`}
              onClick={() => onSelectRelationType(tool.type)}
            >
              <span className="relation-symbol">
                {relationSymbols[tool.type]}
              </span>
              {tool.label}
            </button>
          ))}
        </div>
        <div className="tool-section">
          <h4>클래스 사례</h4>
          <div className="class-example-list">
            {CLASS_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                className="class-example-button"
                onClick={() => onLoadExample(example.id)}
                title={`${example.title} 사례 불러오기`}
              >
                <strong>{example.title}</strong>
              </button>
            ))}
          </div>
        </div>

    </>
  );
}

export default ClassToolPanel;
