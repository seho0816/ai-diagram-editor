import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FlowchartDiagramNode } from './types';
import './FlowchartNode.css';

const handles = [
    { id: 'top', position: Position.Top },
    { id: 'right', position: Position.Right },
    { id: 'bottom', position: Position.Bottom },
    { id: 'left', position: Position.Left },
];

function FlowchartNode({ data, selected }: NodeProps<FlowchartDiagramNode>) {
    return (
        <div className={`flow-node flow-node-${data.shape}${selected ? ' selected' : ''}`}>
            {handles.map((handle) => (
                <Handle
                    key={handle.id}
                    id={handle.id}
                    type="source"
                    position={handle.position}
                />
            ))}
            <div className="flow-node-label">{data.label}</div>
        </div>
    );
}

export default FlowchartNode;
