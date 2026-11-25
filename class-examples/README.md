# 클래스 다이어그램 사례 4종 추가

기존 클래스 도구의 **관계선 아래**에 다음 사례 버튼이 추가됩니다.

| 사례 | 배치 | 클래스 | 관계선 |
| --- | --- | ---: | ---: |
| 고깃집 주문 관리 | Order 중심의 방사형 | 7 | 6 |
| 백화점 매장 관리 | 백화점 → 층 → 매장 계층형 | 7 | 7 |
| 편의점 재고·판매 | 공급자 → 배송 → 재고 → 상품 → 판매 가로형 | 7 | 6 |
| 도서관 대출 관리 | Loan 중심의 좌우 대칭 분기형 | 6 | 6 |

각 사례에는 속성·메서드와 UML 관계 종류, 다중성이 포함됩니다. 사례 데이터는 `classExamples.ts`에서 자유롭게 수정할 수 있습니다.

## 설치 (Windows PowerShell)

1. ZIP을 `ai-diagram-editor` 프로젝트 루트(현재 `src`와 `package.json`이 있는 폴더)에 풀어서 `class-examples` 폴더를 만듭니다.
2. 변경 사항이 있다면 먼저 커밋하거나 JSON으로 백업하는 것을 권장합니다.
3. 프로젝트 루트에서 아래 명령을 실행합니다.

```powershell
git status --short
node .\class-examples\install-class-examples.cjs
npm run build
```

실행 도구는 다음만 변경합니다.

- `src/App.tsx` (확인 대화상자, 사례 적용, AI 상태 정리, 다시 fitView)
- `src/components/ShapeSidebar.tsx` (클래스 도구로 이벤트 전달)
- `src/diagrams/class/ClassToolPanel.tsx` (관계선 다음에 사례 목록 표시)
- `src/diagrams/class/classExamples.ts` (신규)
- `src/diagrams/class/ClassExamples.css` (신규)
- `src/diagrams/class/classExamples.test.mjs` (신규)

기존 App.tsx/사이드바/클래스 도구 원본은 `class-examples/backup/`에 복사합니다. **파일 전체를 교체하지 않으며**, 예상한 수정 위치가 없거나 기존 다른 key와 충돌하면 쓰지 않고 중단합니다. 성공 후에 똑같은 명령을 다시 실행하면 재적용하지 않습니다.

## 사용

클래스 탭 → 왼쪽 클래스 도구 → 관계선 아래 **클래스 사례** → 원하는 사례 선택 → 브라우저 확인 대화상자에서 **확인**.

```
현재 캔버스 내용이 사라집니다.
저장하지 않은 변경 사항도 사라집니다.

'고깃집 주문 관리' 사례를 불러오시겠습니까?
```

- **취소**: 변경하지 않습니다.
- **확인**: 기존 클래스 노드·관계선을 새 사례로 교체하고, AI 분석 상태/편집 중 모달을 정리하며, 사례에 맞는 설계 목적을 미리 입력합니다.
- 배치 전체가 보이도록 React Flow 캔버스를 다시 초기화합니다.
- 이후 클래스/관계선을 자유롭게 이동·편집할 수 있고 AI 분석도 가능합니다.
- 저장·불러오기나 팀원의 유스케이스·플로우차트 소스는 변경하지 않습니다.

> 확인 후에는 원래 캔버스의 미저장 데이터가 사라집니다. 아직 Undo/Redo 기능이 없으므로 중요한 다이어그램은 먼저 저장·내보내기 해 두세요.

## 단위 테스트

```powershell
node --experimental-strip-types --test .\src\diagrams\class\classExamples.test.mjs
```

검증 범위: 4가지 사례, 노드/관계선 참조, 노드 겹침 방지, 재생성 시 데이터 공유 방지 등 총 7개 테스트. 기본 TS/TSX 구문 검사 및 설치 도구의 LF/CRLF 대응을 별도로 확인했습니다. 실제 브라우저 동작과 사용자 컴퓨터에서의 전체 빌드는 실행해야 합니다.

## 설치 실패 시

`[적용 중단]` 오류가 표시되면 무리하게 다른 파일을 덮어쓰지 마세요. 오류와 현재 `src/App.tsx`, `src/components/ShapeSidebar.tsx`, `src/diagrams/class/ClassToolPanel.tsx`를 공유하면 최신 코드에 맞춰 수정할 수 있습니다.
