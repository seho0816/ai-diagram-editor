import { type NodeProps } from '@xyflow/react';
import type { BoundaryNode as BoundaryNodeType } from './types';

function BoundaryNode({ data, selected }: NodeProps<BoundaryNodeType>) {
  return (
    <div
      style={{
        width: data.width || 300,
        height: data.height || 400,
        border: selected ? '2px dashed #2563eb' : '2px dashed #94a3b8',
        borderRadius: '8px',
        background: 'rgba(248, 250, 252, 0.4)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-12px',
          left: '16px',
          background: '#fff',
          padding: '0 8px',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        {data.title}
      </div>
    </div>
  );
}

export default BoundaryNode;