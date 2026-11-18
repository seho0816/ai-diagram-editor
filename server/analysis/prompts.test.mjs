import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnalysisPrompt } from './prompts.mjs';

const diagram = {
    diagramType: 'CLASS',
    purpose: '쇼핑몰 주문 시스템',
    nodes: [{ id: 'n1', type: 'classNode', data: { className: 'User' } }],
    edges: [],
};

test('클래스용 기존 분석 기준을 포함한다', () => {
    const prompt = buildAnalysisPrompt(diagram);
    assert.match(prompt, /UML 클래스 다이어그램/);
    assert.match(prompt, /속성과 메서드/);
    assert.match(prompt, /n1/);
});

test('유스케이스 다이어그램 전용 분석 기준을 포함한다', () => {
    const prompt = buildAnalysisPrompt({ ...diagram, diagramType: 'USE_CASE' });
    assert.match(prompt, /actorNode/);
    assert.match(prompt, /include, extend, generalization/);
    assert.match(prompt, /쇼핑몰 주문 시스템/);
});

test('플로우차트 전용 분석 기준을 포함한다', () => {
    const prompt = buildAnalysisPrompt({ ...diagram, diagramType: 'FLOWCHART' });
    assert.match(prompt, /flowchartNode/);
    assert.match(prompt, /도달 불가능/);
    assert.match(prompt, /startEnd/);
});

test('미지원 다이어그램은 거부한다', () => {
    assert.throws(
        () => buildAnalysisPrompt({ ...diagram, diagramType: 'UNKNOWN' }),
        /지원하지 않는/
    );
});

test('유스케이스의 추가 도형과 관계선 ID도 분석 데이터에 포함한다', () => {
    const caseDiagram = {
        diagramType: 'USE_CASE',
        purpose: '도서 대여 관리',
        nodes: [
            { id: 'actor-1', type: 'actorNode', data: { label: '회원' } },
            { id: 'case-1', type: 'useCaseNode', data: { label: '도서 대여' } },
            { id: 'boundary-1', type: 'boundaryNode', data: { title: '도서관' } },
            { id: 'subsystem-1', type: 'subsystem', data: { label: '대출 관리' } },
            { id: 'external-1', type: 'externalSystem', data: { label: '결제 시스템' } },
            { id: 'note-1', type: 'note', data: { label: '정책 확인' } },
        ],
        edges: [
            { id: 'edge-1', source: 'actor-1', target: 'case-1', data: { relationType: 'association' } },
        ],
    };
    const prompt = buildAnalysisPrompt(caseDiagram);
    assert.match(prompt, /subsystem: 서브시스템/);
    assert.match(prompt, /externalSystem: 외부 시스템/);
    assert.match(prompt, /note: 노트/);
    assert.match(prompt, /source, target/);
    for (const node of caseDiagram.nodes) assert.ok(prompt.includes(node.id));
    assert.ok(prompt.includes('edge-1'));
    assert.match(prompt, /실제로 include\/extend\/generalization이라고 단정하지 마세요/);
});
