
import {
    Handle,
    Position,
    type NodeProps,
} from '@xyflow/react';

import type {
    ClassDiagramNode,
} from '../../types/diagram';

import './ClassNode.css';

// 네 방향 연결점 정의
const handlePositions = [
    { id: 'top', position: Position.Top },
    { id: 'right', position: Position.Right },
    { id: 'bottom', position: Position.Bottom },
    { id: 'left', position: Position.Left },
];

function ClassNode({
                       data,
                       selected,
                   }: NodeProps<ClassDiagramNode>) {
    return (
        <div
            className={`uml-class-node ${
                selected ? 'selected' : ''
            }`}
        >
            {/* 상하좌우 연결점 */}
            {handlePositions.map((handle) => (
                <Handle
                    key={handle.id}
                    id={handle.id}
                    type="source"
                    position={handle.position}
                />
            ))}

            {/* 클래스 이름 */}
            <div className="uml-class-name">
                {data.className}
            </div>

            {/* 클래스 속성 */}
            <div className="uml-class-attributes">
                {data.attributes.length > 0 ? (
                    data.attributes.map((attribute, index) => (
                        <div key={index}>
                            {attribute}
                        </div>
                    ))
                ) : (
                    <span className="uml-placeholder">
            속성 없음
          </span>
                )}
            </div>

            {/* 클래스 메서드 */}
            <div className="uml-class-methods">
                {data.methods.length > 0 ? (
                    data.methods.map((method, index) => (
                        <div key={index}>
                            {method}
                        </div>
                    ))
                ) : (
                    <span className="uml-placeholder">
            메서드 없음
          </span>
                )}
            </div>
        </div>
    );
}

export default ClassNode;
