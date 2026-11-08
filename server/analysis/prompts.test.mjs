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
