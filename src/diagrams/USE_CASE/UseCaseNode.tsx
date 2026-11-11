import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';
import type { UseCaseNode as UseCaseNodeType } from './types';

const handles = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

function UseCaseNode({ data, selected }: NodeProps<UseCaseNodeType>) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={50}
        lineStyle={{ borderColor: '#2563eb' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 100,
          minHeight: 50,
          borderRadius: '50% / 50%',
          backgroundColor: '#ffffff',
          border: selected ? '2.5px solid #2563eb' : '2px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {handles.map((h) => (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={h.position}
            style={{
              background: '#2563eb',
              opacity: selected ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          />
        ))}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#1e293b',
            padding: '0 16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {data.label || '유스케이스'}
        </span>
      </div>
    </>
  );
}

export default UseCaseNode;