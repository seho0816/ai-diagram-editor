import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';
import type { ActorNode as ActorNodeType } from './types';

const handles = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

function ActorNode({ data, selected }: NodeProps<ActorNodeType>) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={70}
        minHeight={80}
        keepAspectRatio
        lineStyle={{ borderColor: '#1d4ed8' }} // 2026-11-18 스타일
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 70,
          minHeight: 80,
          backgroundColor: 'transparent',
          border: selected ? '2px dashed #1d4ed8' : '2px dashed transparent', // 2026-11-18 스타일
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {handles.map((h) => (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={h.position}
            style={{
              background: '#1d4ed8', // 2026-11-18 스타일
              opacity: selected ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          />
        ))}
        <svg
          viewBox="0 0 24 32"
          fill="none"
          stroke="#0f172a" // 2026-11-18 스타일
          strokeWidth="2.4" // 2026-11-18 스타일
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flex: 1, minHeight: 0, width: '60%', marginTop: '6px', marginBottom: '4px' }}
        >
          <circle cx="12" cy="5" r="3.5" />
          <path d="M12 8.5v11.5M6 13h12M12 20l-5 9.5M12 20l5 9.5" />
        </svg>
        <div
          style={{
            fontSize: '14px', // 2026-11-18 스타일
            fontWeight: 800, // 2026-11-18 스타일
            color: '#0f172a', // 2026-11-18 스타일
            textAlign: 'center',
            width: '100%',
            padding: '0 4px 6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.label || '액터'}
        </div>
      </div>
    </>
  );
}

export default ActorNode;