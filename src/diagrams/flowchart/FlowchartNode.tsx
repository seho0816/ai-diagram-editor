import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FlowchartDiagramNode } from './types';
import './FlowchartNode.css';
import { useFlowchartFeatures } from './FlowchartFeatures';

const handles = [
    { id: 'top', position: Position.Top },
    { id: 'right', position: Position.Right },
    { id: 'bottom', position: Position.Bottom },
    { id: 'left', position: Position.Left },
];

function FlowchartNode({ id, data, selected }: NodeProps<FlowchartDiagramNode>) {
    const features = useFlowchartFeatures();
    const active = features?.activeNodeId === id;
    return (
        <div className={`flow-node flow-node-${data.shape}${selected ? ' selected' : ''}${active ? ' flow-node-sim-active' : ''}`}>
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
