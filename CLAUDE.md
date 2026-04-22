# 풍당수학 학원 관리 시스템 — CLAUDE.md

이 파일은 Claude Code가 매 세션 시작 시 가장 먼저 읽고 프로젝트 맥락을 파악하는 자급자족형 지침이다.
세션 마무리 시 Claude Code가 이 파일을 직접 갱신하여 다음 세션으로 컨텍스트를 넘긴다.

---

## 1. 앱 기본 정보

- **앱 이름**: 풍당수학 학원 관리 시스템
- **현재 파일**: `index.html` (단일 HTML 파일)
- **GitHub 저장소**: https://github.com/beybusiness-bit/pongdang-manager
- **배포 URL**: https://beybusiness-bit.github.io/pongdang-manager/

```javascript
const AUTH = {
  ALLOWED_EMAILS: ['pongdang.math@gmail.com'],
  CLIENT_ID: 'TBD',
  SHEET_ID: '1_CFlWnHOi13EFlp8QAUYATdo6lruzXMDfAelxR1Xa0o',
};
```

---

## 2. 앱 아키텍처 요약

- **앱 성격**: 풍당수학 학원장과 강사들이 학생·결제·교재·근무·매출을 한 곳에서 관리하는 내부 운영 도구. 기존에 노션과 구글 시트로 분산해 쓰던 자료를 단일 앱으로 통합 마이그레이션.
- **UI 구조**: 좌측 사이드바 + 메인 콘텐츠. 사이드바 메뉴: 대시보드 / 학생 관리 / 교재 관리 / 결제 관리(서브탭: 결제기록·월별등록대장) / 캘린더 / 리포트(매출 리포트 등). 데스크탑 우선, 일부 페이지는 모바일 비대응 안내.
- **로그인**: Google OAuth 필수. `ALLOWED_EMAILS`에 등록된 계정만 진입 가능.
- **사용자 역할**: 학원장(OWNER) / 선생님(TEACHER) / 보조쌤(ASSISTANT) — 역할별로 세부 권한(보기·쓰기) 분기. 현재 더미 사용자는 학원장 역할.
- **외부 연동**: Google OAuth (로그인) + Google Sheets API (데이터 저장). 추후 문자 CRM, 이메일 등 연동 예정.
- **기술 스택**: 단일 HTML 파일 + 인라인 CSS/JS, GitHub Pages 배포

---

## 3. 세션 운영 원칙

### 세션 시작 시
Claude Code는 **반드시 이 파일을 먼저 읽고** 다음을 파악한 뒤 작업을 시작한다:
- "개발 단계 현황"에서 현재 어느 phase에 있고 무엇이 완료되었는지
- "다음 세션 시작점"에서 당장 이어서 할 작업이 무엇인지
- "가이드 문서 참고 내용 누적"에서 누적된 UX·입력 규칙·주의사항

### 용어 구분 (중요)
- **Phase**: "개발 단계 현황"에 나열된 큰 개발 단위 (예: "결제 관리", "근무일지" 등)
- **작업 단계**: 한 세션 안에서 일을 쪼개서 진행하는 하위 단위
- ⚠️ 둘을 절대 혼동하지 말 것. "작업 단계 하나 끝났다"는 이유로 마무리 작업(이 파일 갱신)을 수행하면 안 된다.

### 새 세션 권유 (Claude Code가 먼저 제안 가능)
다음 경우 사용자에게 새 세션을 권유할 수 있다:
- 한 phase가 완전히 마무리되었을 때
- 컨텍스트가 과도하게 쌓여 작업 효율이 떨어질 때
- 새로운 기능 영역에 진입할 때
- 오류 반복으로 맥락이 꼬였을 때

권유는 권유일 뿐. 사용자의 응답을 기다린다.

### CLAUDE.md 갱신 트리거 (사용자의 명시적 의사 표현 필수)
이 파일의 갱신은 **오직 사용자가 명시적으로 세션 종료 의사를 표현할 때만** 수행:
- "마무리할게" / "세션 끝내자" / "새 세션 열게" 등
- Claude Code의 권유에 사용자가 "응" / "그래" / "그러자" 등으로 동의

❌ **절대 금지**:
- 작업 단계 하나가 끝났다는 이유로 자동 갱신
- Claude Code가 권유한 직후 사용자 응답 없이 자동 갱신
- 사용자 피드백/테스트 결과 받기 전 자동 갱신

### 갱신 시 반영 대상
- 완료된 phase는 ✅로 표시
- "다음 세션 시작점" 업데이트
- DB 구조 변경 사항 반영
- 이번 세션에서 가이드 문서에 참고할 만한 내용을 "가이드 문서 참고 내용 누적"에 추가
- ⚠️ 원본 내용을 임의로 축약·삭제하지 말 것. 사용자와의 논의로 합의된 변경만 수행.

---

## 4. Phase 2: 개발 진행 프로토콜

### 코드 작업 원칙

```javascript
// today() — 반드시 로컬 날짜 기준 (toISOString() UTC 방식 절대 금지)
const today = () => {
  const d = new Date();
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
};
```

- 파일 상단의 `const AUTH = {...}` 상수는 매 작업 후에도 위 실제값을 유지한다.
- 작동하는 코드는 함부로 전체 교체하지 않는다. 부분 수정 우선.
- 사용자가 명시적으로 지시하지 않은 변경·추가 구현을 임의로 진행하지 않는다. 의문이 생기면 반드시 확인.

### 절대 금지 사항
- `<script>` 내부 백틱(`) 중첩
- `<script>` 내부 `&` `<` `>` `"` 직접 삽입 (HTML 파싱 깨짐 위험)
- `innerHTML` 사용 시 null 체크 생략
- `toISOString()` 기반 UTC 날짜 사용
- `</script>` 바깥에 코드가 빠져나오는 구조 (과거 버그 사례 있음 — 반드시 `</script>` 안쪽에서 함수 정의)
- 같은 함수 이름의 중복 정의 (뒤의 정의가 앞을 덮어쓰는 사고 발생함)

### 매 작업 후 필수
- `node --check` 또는 동등한 방식으로 script 블록 문법 검사 (HTML 파일이라 `node`로 직접은 안 되니, script 태그 내부만 추출해서 `new Function(scriptContent)` 검증)
- 사용자가 결과물을 받아볼 수 있는 형태로 전달

### 수정 방식
- 부분 수정: `Edit` 또는 `str_replace` 활용
- 대량 교체(50줄 이상): Python 스크립트로 라인 범위 교체
- 새 함수 추가: 관련 함수 근처에 추가하되, 반드시 `</script>` 안쪽인지 확인

### 모달 중첩 / z-index
- 현재 `openModal()` 함수가 자동으로 z-index를 누적 계산 (1000부터 +10씩)
- 모달 위에 모달 띄우기 가능
- `closeModal()`은 300ms setTimeout으로 display:none 처리하므로, 닫고 바로 다른 모달 열 때는 100ms 정도 setTimeout 권장

---

## 5. Phase 3: 배포 프로토콜

1. `index.html` GitHub 저장소 (https://github.com/beybusiness-bit/pongdang-manager) 에 업로드
2. GitHub Repository → Settings → Pages → Branch: `main` → Save
3. Google Cloud Console → OAuth 클라이언트 ID에 배포 URL(`https://beybusiness-bit.github.io/pongdang-manager/`) 추가
4. ALLOWED_EMAILS 계정들이 OAuth 동의 화면 테스트 사용자로 등록되어 있는지 확인
5. 배포 후 ALLOWED_EMAILS 계정으로 로그인 테스트

빠른 테스트 옵션:
- UI만 빠르게 보고 싶다 → Chrome으로 index.html 직접 열기
- Sheets 포함 전체 동작 → netlify.com/drop 에 드래그 앤 드롭으로 임시 배포
- 최종 → GitHub Pages

---

## 6. Phase 4: 가이드 문서 작성 프로토콜

배포 완료 후 사용자 요청 시, 아래 프롬프트를 완성해서 출력한다.
이 시점에서 "가이드 문서 참고 내용 누적" 항목의 내용을 프롬프트 안에 포함시킨다.

```
지금까지 이 프로젝트에서 개발한 앱의 사용 가이드를 노션에 작성해줘.
노션 MCP로 바로 작성. 작성할 노션 페이지 URL: [URL]

앱 이름: 풍당수학 학원 관리 시스템
접속 URL: https://beybusiness-bit.github.io/pongdang-manager/
로그인: Google OAuth (허가된 이메일만)
허가 이메일: pongdang.math@gmail.com (외 추가된 계정)
데이터 저장: Google Sheets (ID: 1_CFlWnHOi13EFlp8QAUYATdo6lruzXMDfAelxR1Xa0o)

주요 기능 (사이드바 순서): [구현된 메뉴 전체]
주요 워크플로우: [반복 업무 흐름]

개발 과정에서 수집된 가이드 참고 내용:
[아래 "가이드 문서 참고 내용 누적" 항목 전체 삽입]

문서 요건:
- 대상: 기술 배경 없는 처음 사용자
- 구성: 시작하기 → 메뉴별 기능 → 주요 워크플로우 → 주의사항·FAQ
- 각 섹션에 "📸 이미지 추가 위치: [캡처할 화면]" 안내 포함
- 관리자(학원장)용 섹션 포함
```

---

## 7. 개발 단계 현황

✅ **1단계: 기본 구조 및 로그인**
- Google OAuth 로그인
- 권한 시스템 (학원장 / 선생님 / 보조쌤)
- 세부 권한 (보기·쓰기)
- 기본 레이아웃 (사이드바, 헤더)

✅ **2단계: Google Sheets 연동 및 데이터 구조**
- 20개 시트 생성 및 스키마 정의
- Sheets API 연동
- 기본 CRUD 함수

✅ **3단계: 대시보드**
- 학생 수, 매출, 공지 등 간소화된 대시보드
- 공휴일 표시

✅ **4단계: 학생 관리 기본**
- 학생 목록 (필터링, 검색)
- 학생 추가/수정/삭제
- [개선] 학생 추가/수정 모달이 콜백 지원 (월별등록대장에서 재사용 가능)
- [개선] 행 전체 클릭 시 상세 모달 오픈
- [개선] "작업" 컬럼 제거
- [개선] 필터 헤더 '학년' → '학교급' 교정
- [개선] 테이블 헤더/셀 중앙 정렬

✅ **5단계: 학생 관리 고급**
- 학생 상세 페이지 (모달)
- 권한별 데이터 접근 제어
- [개선] 상세 모달의 "수정" 버튼 정상 동작 (중복 함수 제거 + setTimeout 딜레이)

✅ **6단계: 교재 관리**
- 교재 목록
- 교재 CRUD
- 학생-교재 연결
- 프로필 사진 시스템 (Base64)
- 등록/퇴원 기록

🔄 **7단계: 결제 관리** (진행 중)

✅ 완료된 부분:
- 결제 내역 입력 (개별)
- 결제기록 모달 UI 개선
- 요일 양방향 연동 (결제기록 ↔ 학생 관리)
- 더미 데이터 (32개 결제 + 31명 학생, studentId 자동 매핑)
- 결제기록 탭 헤더 sticky (각 `<th>`에 적용)
- 결제 모달: "신입 학생 이름 직접 입력" 필드 제거 → 학생 DB에서 선택하도록 통일
- 결제 모달: 신입 토글 ON일 때 "+ 학생 추가" 버튼 표시
- 결제 모달 ↔ 학생 추가 모달 중첩 흐름 구현 (`openStudentFormFromPayment`)

✅ 월별등록대장 (완료):
- 월별 탭 시스템 (탭 추가 / 검색 / 정렬)
- 월 추가는 앱내 모달 + `<input type="month">` 날짜선택기 사용
- 결제 관리 페이지 진입 시마다 현재 월 자동 선택
- 학교급 판단: `grade` 첫 글자(초/중/고)로 그룹 분류 (schoolType 필드 저장하지 않고 파생)
- 초/중/고 그룹별 테이블 + 각각 합산 행
- 신입 그룹은 학교급 무관하게 별도, 하단에 "+ 신입 추가" 버튼 행 + 합산 행
- 칼럼: No, 학년, 담당T, 학생명, 요일, 교습비, 수강반, 횟수, 입금금액, 수수료, 결제날짜, 입금날짜, 결제수단
- 정렬: 학년 오름차순 → 이름 가나다순 (신입은 학교급 → 학년 → 이름)
- No는 각 그룹 내 독립 카운트
- 행 전체 클릭 시 결제 수정 모달 오픈
- **그룹별 키컬러**:
  - 초등: 노랑 (header `#FFF4B8` / subtotal `#FFEC99` / title `#B58900`)
  - 중등: 연두 (header `#D4F0C5` / subtotal `#BBE8A6` / title `#3E8B3E`)
  - 고등: 주황 (header `#FFD9B3` / subtotal `#FFC28C` / title `#C25A0A`)
  - 신입: 연청록 (header `#C8ECE7` / subtotal `#A5DED6` / title `#2E7D72`)

🔜 7단계 대기 중:
- 사용자 테스트 및 피드백 (현재 시점)
- 피드백 후 결제 관리 나머지 기능 (있다면) 마무리

---

🔄 **교차 작업: UX 개선 및 반응형 대응** (2026-04-21 세션에서 진행, 사용자 피드백 대기)

✅ 이번 세션에 완료하여 배포한 항목 (검증 필요):
- **검색 UX 전면 개선**: 기존 "타이핑 중 리렌더로 한글 조합 깨짐" + "커서 튕김" 문제를 composition-aware 실시간 검색으로 해결. 검색 버튼 없이 타이핑만으로 즉시 필터링. 적용 범위: 학생 검색 / 교재 검색 / 월별등록대장 월 검색 / 결제기록 학생명 검색 (4곳 전체). `handleXxxSearchInput` + `oncompositionstart/end` 패턴 사용. `renderPreservingFocus` 헬퍼로 리렌더 후 포커스 복원.
- **사이드바 구조 재편**:
  - 기존 외부 독립 토글 버튼 제거
  - 사이드바 내부 우측상단에 `.sidebar-collapse-btn` (접기, `✕`) — position: absolute
  - 사이드바 외부에 `.sidebar-expand-btn` (펼치기, `☰`) — `.sidebar.collapsed ~` 조합으로 접혔을 때만 표시
  - 모바일은 기존 `mobile-header`의 햄버거를 `.open` 클래스 토글하도록 `toggleSidebar()` 로직 수정 (데스크톱은 `.collapsed` 클래스, 모바일은 `.open` 클래스 사용)
  - `.page-header { margin-left: 0 }` 기본, 접혔을 때만 60px (펼치기 버튼 공간)
- **학생 관리 뷰 전환 탭**: 기존 `btn btn-primary/btn-outline` → 결제 관리와 동일한 `.tab-btn active` 스타일로 통일
- **`+ 학생 추가` 모달 크래시 수정**: 학생 폼 HTML에 `student-number` 숨김 필드가 없어서 `document.getElementById('student-number').value = ...`가 null 참조 에러로 터짐 → 숨김 input 추가로 해결 (결제 모달 안에서 학생 추가, 그리고 학생 관리 페이지에서 학생 추가 버튼 양쪽 모두 영향받던 버그)
- **행 호버 효과**: `tr.clickable-row:hover` CSS 추가 후 결제기록/월별등록대장 행에 적용
- **신입 그룹 🆕 이모지 제거**: 월별등록대장 신입 그룹 제목
- **모달 열릴 때 스크롤 최상단 리셋**: `openModal()`에 `requestAnimationFrame` → `scrollTop = 0` 추가. 모든 모달에 영향. 상세→수정 전환 시 중간부터 보이던 문제 해결.

✅ 모바일 전용 개선 (사용자가 명시적으로 "데스크탑에 영향 없어야 함" 조건 걸었음):
- **페이지 타이틀/설명 전체 숨김** (모든 페이지): `@media(max-width: 768px) { .page-header { display: none } }`. 이유: `mobile-header`에 페이지명이 이미 노출되어 중복.
- **학생 관리 필터/정렬/버튼 3단 배치**:
  - Row 1: 검색창 (가로 꽉 채움)
  - Row 2: 학교급 필터 + 정렬 셀렉트 (한 줄, 각 50%)
  - Row 3: CSV 업로드 + 학생 추가 (한 줄, 각 50%)
  - 구현: `.filter-sort-row`, `.page-action-buttons` wrapper를 desktop에선 `display: contents`로 투명하게, 모바일에선 `display: flex`로 재배치
- **학생 목록 카드뷰** (테이블 대체): 사용자가 지정한 레이아웃:
  - 좌측상단: 체크박스 / 우측상단: 학생번호
  - 왼쪽: 프로필 사진 56px
  - 오른쪽 3줄: (1) 이름 + 학년, (2) 학교, (3) 담당선생님, 요일
  - 속성명 없이 값만 표시, 호버·클릭은 데스크톱 테이블과 동일 동작 (상세 페이지 이동)
- **등록/퇴원 기록 수정 모달 반응형**: 기존 테이블을 data-label 기반으로 모바일에서 카드 스택 형태로 변환. 유형/날짜/메모/삭제 각각 레이블과 함께 세로 배치.

---

🔄 **교차 작업: 2026-04-22 세션 피드백 반영** (배포 완료, 사용자 테스트 대기)

> 사용자 원문 그대로 (축약 금지):
>
> "1. 사이드바가 펼쳐져있을 때에는 접기 버튼의 테두리와 배경색을 없애서 그냥 사이드바의 우측상단에 X 표시가 있는 것처럼 보이게 해
> 2. 검색창은 모든 페이지에서 한글로 쳤을 때 여전히 깨져서 쳐지고 그래서 검색이 안됩니다. 다시 개선하세요
> 3. 모든 수정/추가 모달에서 이렇게 적용시켜: 모달 상단에 스티키로 바를 두고, 바의 좌측 정렬로는 어떤 모달인지 제목을, 우측 정렬로는 수정 및 닫기 버튼 등 동작 버튼을 띄워서 어느 스크롤에서든 모달 제목과 동작버튼을 볼 수 있게 해줘
> 4. 학생 관리 모바일로 봤을 때 전체 선택 체크박스가 없음. 만들어라
> 5. 학생 관리 모바일로 볼 때 카드뷰 이렇게 개선해: 선택 박스가 카드 우측 상단으로 오게 바꿔. 학생 번호는 학생 이름 오른쪽 옆으로 () 괄호 안에 넣어서 나오게 만들어. 카드 안에서 한 줄에 같이 있는 요소들은 사이에 여백을 지금보다 좀 더 넓혀줘. 요소들 사이 구분좌를 두지 말고 여백으로 구분되게 만들어. 지금 보면 담당선생님과 요일 사이에 콤마로 구분되어있어. 그거 없애."
>
> 사용자 추가 지침 (동일 메시지): "너가 정리해준 항목들 모두 테스트해봤고, 따로 언급을 안하는 항목은 지금 상태가 마음에 드는 거라고 생각하면 돼"
>
> → 이 말은 2026-04-21 세션의 검증 필요 항목 중 **이번에 언급되지 않은 항목은 모두 통과**로 간주해도 된다는 사용자의 명시적 승인. 재질문 불필요.

✅ 이번 세션에 완료하여 배포한 항목 (검증 필요):
- **사이드바 접기 버튼 미니멀 스타일**: `.sidebar-collapse-btn`에서 `background`, `border`, `border-radius` 제거 → `background: transparent; border: none`으로 변경. 크기는 36×36 → 24×24로 축소. 호버 시 색만 `--text3` → `--text`로 변경. 펼친 상태에서 그냥 X 글리프만 우상단에 떠있는 것처럼 보임.
- **검색 한글 IME 깨짐 근본 해결 (구조 재편)**: 기존 composition-aware 방식(re-render 시 DOM 교체 → IME 컨텍스트 손상)을 폐기. **shell + body** 구조로 전환:
  - `renderXxxPage()` = 쉘 렌더 (검색 입력창 포함). 쉘은 뷰 전환/CRUD 시에만 재렌더.
  - `renderXxxListBody()` = 리스트 본체 렌더. 검색·필터·정렬·선택 변경 시 이 함수만 호출 → 검색 input DOM이 교체되지 않음 → IME 컨텍스트 유지.
  - 적용 대상 4곳:
    - **학생 관리**: `renderStudentsPage` + `renderStudentsListBody` (mount `#students-list-body`). 핸들러 변경: `handleStudentSearchInput`, `updateStudentFilter`, `updateStudentSort`, `toggleAllStudents`, `toggleStudentSelection`, `clearSelection`, `changePage`, `changePageSize` 모두 body만 재렌더.
    - **교재 관리**: `renderTextbooksPage` + `renderTextbooksListBody` (mount `#textbooks-list-body`). 핸들러: `handleTextbookSearchInput`, `updateTextbookFilter`, `updateTextbookSort`, `changeTextbookPage`, `changeTextbookPageSize`, `toggleTextbookSelection`, `clearTextbookSelection`, `changeTextbookView`, `toggleAllTextbooksSelection`.
    - **월별등록대장**: `renderEnrollmentLedger`를 `void` 함수로 전환(직접 `#payments-tab-body`에 쓰기) + `renderLedgerMonthTabs` (mount `#ledger-month-tabs`) + `renderLedgerMonthData` (mount `#ledger-month-data`). 월 검색은 탭만 재렌더, 월 선택은 탭+데이터 재렌더. `toggleLedgerSortOrder`는 정렬 버튼 텍스트만 DOM 직접 업데이트 + 탭 재렌더.
    - **결제기록**: `renderPaymentRecords`를 `void` 함수로 전환 + `renderPaymentRecordsListBody` (mount `#payment-records-body`). 핸들러: `handlePaymentRecordSearchInput`, 필터/정렬 onchange, `changePaymentPage`, `changePaymentPageSize`, `togglePaymentSelection`, `toggleSelectAllPayments` 모두 body만 재렌더. `bulkDeletePayments`는 CRUD라 전체 재렌더.
  - **구조 변경의 부작용**: 학생/교재의 `.bulk-actions-bar`가 기존에 tab-bar와 page-actions **사이**에 있었는데, 이제 page-actions **아래** (list body 안)에 위치. 선택했을 때만 보이는 UI라 큰 시각적 차이 없음.
  - 기존 `oncompositionstart/end` 핸들러 및 `renderPreservingFocus` 호출 모두 제거. `renderPreservingFocus` 함수 자체는 남아있지만 호출처 0개 (데드코드).
- **모달 스티키 헤더 일괄 적용**:
  - CSS: `.modal-title { position: sticky; top: 0; z-index: 10; background: white; display: flex; justify-content: space-between; align-items: center; }`. 제목 좌측, 액션 버튼 우측. 모달 스크롤 시 상단 고정.
  - 런타임 마이그레이션 함수 `migrateModalHeaders()` 추가 (DOMContentLoaded 시 1회 실행):
    - 각 `.modal-backdrop`의 `.modal-title`을 `.modal-title-text` (좌측 텍스트) + `.modal-title-actions` (우측 액션 영역) 구조로 전환.
    - 기존 `.modal-title`에 있던 `id`는 `.modal-title-text` 스팬으로 이관 → `getElementById('student-form-title').textContent = '학생 수정'` 같은 기존 코드가 그대로 동작.
    - `.modal-footer` 안의 버튼들을 `.modal-title-actions`로 이동 → 원래 우하단에 있던 취소/저장 버튼이 우상단 스티키로 이동.
    - 이동 후 `.modal-footer`에 `hidden-by-sticky` 클래스 부여 → CSS `display: none`으로 숨김.
    - 이미 제목 영역에 flex가 인라인 스타일로 들어간 상세 모달 (`modal-textbook-detail`, `modal-student-detail`)은 인라인 `style` 제거 후 기존 구조에 클래스만 추가.
  - 영향 범위: 정적 HTML로 선언된 11개 모달 전체.
- **학생 모바일 카드뷰 전체선택 체크박스 추가**: 카드 리스트 바로 위에 `.student-cards-mobile-header` (모바일 전용 `display: flex`, 데스크톱 `display: none`)를 추가하고 "전체 선택" 라벨과 체크박스 배치. 체크박스 클릭 시 `toggleAllStudents(this)` 호출 → 현재 페이지 학생 전부 선택/해제.
- **학생 모바일 카드뷰 레이아웃 개선**:
  - 체크박스: 카드 **우측 상단**으로 이동 (`.student-card-checkbox { position: absolute; top: 12px; right: 12px; }`). 카드에 `padding: 14px 36px 14px 14px` (우측 여백 확대 — 체크박스 공간 확보).
  - 학생 번호: 이름 옆에 `(번호)` 형태로 인라인 표기 (`.student-card-number-inline`). 별도 우상단 번호 삭제.
  - 각 카드 라인 내 요소 간 여백: `display: flex; gap: 14px` (기존 콤마 구분 → flex gap으로).
  - 담당선생님과 요일 사이 **콤마 제거**: `'${teacher}, ${days}'` → 두 개의 `<span>` 요소로 분리. CSS의 gap으로 시각적 구분.
- **기타 구조적 영향**:
  - `textbook-search-input`에 `oncompositionstart/end` 제거, `oninput="handleTextbookSearchInput(this)"`만 유지.
  - `ledger-month-search`, `payment-record-search` 동일.
  - 리스트 mount 패턴으로 변경되면서 `container.innerHTML = ...` 전에 `<div id="xxx-list-body"></div>` 같은 빈 마운트가 들어감 → 초기 렌더에서 `renderXxxListBody()` 호출이 연속으로 일어남.

🔲 **학교 DB + 관리 대분류 메뉴 재구성** (2026-04-21 세션에서 논의, 여전히 미착수 — 다음 세션 최우선 과제)

> 사용자 원문 (임의 축약 금지):
>
> "학생 정보에서 '학교' 정보를 연결하면 해당 학교가 가지고 있는 학교급 정보를 그대로 속성에서 자동으로 연결하게 해줘. 예를 들어 풍당초등학교가 선택되면, 이 학교는 당연히 학교급이 초등인거야. 그래서 학교급을 별도로 선택할 필요 없이 곧바로 초등으로 나오는 거지. 사실상 학교급은 따로 선택할 필요가 없고 학교만 선택하면 자동으로 선택되어야하는 값이어야 했던 거 같아.
>
> 그리고 학교 목록이라는 db를 따로 관리할 필요가 있겠네. 수강반, 담당T 목록 등처럼 관리할 수 있게 해주고, 수강반 관리 / 학교 관리 / 선생님 관리 라는 페이지를 메뉴에서 대분류 '관리'에 포함시켜서 넣어줘.
>
> 다만 관리 대분류에 속하는 모든 메뉴명에서 '관리'를 빼줘ㅎㅎㅎ 너무 반복된다.
>
> 이 요소가 노출되거나 연결되거나 영향을 미치는 모든 곳에 동일하게 적용해."

실행 상세:
- **Schools DB**: 이미 스키마 존재 (`id, name, type(초/중/고)`). CRUD UI는 아직 없음.
- **메뉴 추가**: 수강반 / 학교 / 선생님 — `MENUS`의 `manage-group.children`에 추가
- **메뉴명 정리**: `manage-group.children` 안의 모든 name에서 "관리" 제거
  - 현재 목록: `학생 관리, 교재 관리, 결제 관리, 급여 관리`
  - 변경 후: `학생, 교재, 결제, 급여, 수강반, 학교, 선생님`
- **학교 선택 → 학교급 자동 연결**:
  - 학생 추가/수정 폼의 `student-school` 드롭다운이 현재는 `schoolsData`에서 옵션 생성 중
  - 학생 폼의 `student-school-level` 셀렉트 자체를 제거하거나 readonly로 바꾸고, 학교 선택 시 해당 학교의 `type`을 자동 세팅 → `grade` 조합 시 그대로 사용
  - 기존 `autoFillSchoolLevel()` 함수가 이미 존재 (line ~3684) — 이 함수를 발전시켜 schoolsData 연동 추가
  - ⚠️ `schoolType`은 DB에 저장하지 않음 (기존 규칙 유지). `grade` 첫 글자로 런타임 파생.
- **영향 범위**: 학교/학교급이 노출되거나 연결되는 곳 전체에 적용
  - 학생 추가/수정 폼 (학교 선택 → 학교급 자동)
  - 학생 목록 (desktop 테이블 + mobile 카드뷰)
  - 학생 상세 모달 (학교, 학년 표시)
  - 결제 모달 (학생 선택 시 파생 자동)
  - 월별등록대장 (학교급 그룹화 — 이미 grade에서 파생 중이라 영향 미미)
  - CSV 업로드 (학교명 파싱 시 schoolsData 조회해서 type 확정)

🔲 **8단계: 근무일지**
🔲 **9단계: 피드백톡 시스템**
🔲 **10단계: 문자 CRM 연동**
🔲 **11단계: 회의록**
🔲 **12단계: 시험대비 체크리스트**
🔲 **13단계: 매출 리포트**
🔲 **14단계: 운영비용 관리**
🔲 **15단계: 급여 관리**
🔲 **16단계: 설정 탭**
🔲 **17단계: AI 학생 분석 기능**
🔲 **18단계: 학생 리포트 탭**
🔲 **19단계: 이용 가이드**
🔲 **20단계: 최종 테스트 및 배포**

---

## 8. DB 구조 (Google Sheets 시트 구성)

> 현재 시점에서 본격 사용 중인 데이터 구조. Sheets 실제 연결은 단계적으로 진행 중이며, 클라이언트 메모리에 더미 데이터로 동작하는 부분도 있다.

### Students (학생)
```
id, number, name, school, grade, birthdate, teacher, class, days,
phone, parentPhone, parentType, address, memo, profileImage,
enrollmentRecords (서브 배열: id, type, date, memo),
createdAt
```
- ⚠️ `schoolType` 필드는 **저장하지 않는다**. `grade`의 첫 글자(초/중/고)로 런타임에 판단.
- `grade` 형식: `"초5"`, `"중2"`, `"고1"` 같은 형태
- `days` 형식: `"월, 수"` 같은 콤마 구분 문자열
- `profileImage`: Base64 인코딩된 이미지 문자열

### Textbooks (교재)
```
id, title, author, publisher, price, level, subject, createdAt
```

### StudentTextbooks (학생-교재 연결)
```
id, studentId, textbookId, assignedDate
```

### Payments (결제)
```
id, studentId, studentName, enrollmentMonth, isNewStudent,
teacherName, days, classId, discountTypeId, count,
baseTuition, discountAmount, finalTuition,
paymentDate, depositDate, paymentMethodId,
depositAmount, fee, isTeacherPayment,
createdAt
```
- `studentName`은 학생 DB에서 파생 (신입/기존 무관하게 `studentId` 기반으로 자동 세팅)
- `enrollmentMonth` 형식: `"2026-04"` (YYYY-MM)
- `isNewStudent`: boolean — 신입 여부
- `isTeacherPayment`: boolean — 강사 직접 수금 여부

### Classes (수강반)
```
id, name, teacher, days, time, tuition
```

### DiscountTypes (할인 종류)
```
id, name, discountRate, fixedAmount, memo
```

### PaymentMethods (결제수단)
```
id, name, feeRate
```

### Teachers (선생님)
```
id, name, role, phone, ...
```

### Schools (학교)
```
id, name, type (초/중/고)
```

### CostCategories (비용 항목 카테고리)
```
id, name, defaultValue, sortOrder
```

### OperatingCosts (운영비용)
```
id, monthYear, categoryId, amount, memo
```

### 그 외 시트 (8단계 이후 본격 사용 예정)
근무일지, 피드백, 회의록, 시험대비 체크리스트, 공지사항, 급여 등

---

## 9. 가이드 문서 참고 내용 누적

### 학생 관리
- 학생 행 전체를 클릭하면 상세 모달이 뜬다 (이름만 클릭할 필요 없음)
- 상세 모달의 "수정" 버튼은 상세 모달을 닫고 100ms 후 수정 모달을 띄움
- 학교급 필터는 학교급(초/중/고) 단위로만 필터링됨 — 학년 단위는 별도 정렬·검색으로
- "작업" 컬럼이 없는 이유: 행 클릭 = 상세 진입이라 중복 제거함
- 프로필 사진은 Base64로 저장됨 → 너무 큰 이미지는 성능 저하 우려, 사용자에게 적당한 크기 안내 필요

### 결제 관리
- 결제 모달의 "신입 여부" 토글은 결제기록을 신입 그룹으로 분류하는 용도일 뿐, 학생 DB는 신입/기존 모두 동일하게 사용함
- 신입 토글 ON 시에만 "+ 학생 추가" 버튼이 보임 (결제 모달 안에서 학생 추가 가능)
- 결제 모달에서 학생을 선택하면 담당T, 요일이 자동 채워짐
- 결제 모달에서 요일을 학생 원래 요일과 다르게 변경하면 "변경된 요일은 학생 정보에도 반영됩니다" 안내가 뜸 — 저장 시 학생 DB의 요일도 같이 업데이트됨

### 월별등록대장
- 결제 관리 페이지에 진입할 때마다 현재 월 탭으로 자동 리셋됨 (이전에 다른 월 탭을 선택했어도)
- 월 추가는 `+ 월 추가` → 앱내 모달에서 날짜선택기로 월 선택 → 추가
- 신입 그룹은 학교급(초/중/고) 무관하게 별도로 표시되며, 정렬은 학교급 → 학년 → 이름 순
- 그룹별 키컬러: 초등(노랑) / 중등(연두) / 고등(주황) / 신입(연청록)
- 합산 행: 학생 수, 교습비, 입금금액, 수수료 합계
- 신입 그룹 하단의 "+ 신입 추가" 버튼 → 신입 토글 ON + 등록월이 현재 탭 월로 고정된 결제 추가 모달이 뜸

### 데이터 입력 규칙
- 학년은 항상 `"초5"`, `"중2"`, `"고1"` 형식. 학교급 한 글자 + 학년 숫자
- 등록월은 `YYYY-MM` 형식
- 요일은 `"월, 수"` 같은 콤마+공백 구분 문자열
- 모든 날짜는 로컬 기준 `today()` 함수 사용 (UTC 변환 금지)

### UX 주의사항
- 모달 닫고 바로 다른 모달을 띄울 때는 100ms setTimeout 필요 (애니메이션 충돌 방지)
- 모달 중첩 시 z-index는 `openModal()`이 자동 계산해줌
- 같은 함수를 두 번 정의하면 뒤의 것이 앞을 덮어쓰는 사고 발생 → 함수 추가 시 grep으로 중복 확인 필수
- `</script>` 바깥에 코드가 빠져나오면 화면 하단에 글자로 보이고 함수가 실행되지 않음 → 신규 함수는 반드시 `</script>` 안에 있는지 확인
- 모든 모달은 열릴 때 `scrollTop = 0`으로 최상단 리셋 (`openModal`에 내장). 모달이 중간부터 보이는 문제 방지.

### 검색 구현 표준 (프로젝트 공통)
- **실시간 검색 기본**: 타이핑과 동시에 필터링. 검색 버튼·Enter 요구 금지.
- **한글 IME 대응 필수**: `oncompositionstart="this.dataset.composing='1'"`, `oncompositionend="this.dataset.composing='0'; handleXxxSearchInput(this)"` 패턴 사용. 핸들러 진입 시 `if (input.dataset.composing === '1') return;`으로 조합 중 필터 건너뜀.
- **핸들러 구조** (예: 학생): `handleStudentSearchInput(input)` → composing 체크 → `currentStudentFilter.search = input.value` → pagination 리셋 → `renderPreservingFocus(renderStudentsPage)`.
- **참고 구현**: `bey-manager`의 시간표 검색(`handleScheduleSearch`)에서 영감. 거기선 입력 DOM 자체가 정적이라 포커스 유실이 원천 차단됨. pongdang은 전체 페이지 리렌더 구조라 `renderPreservingFocus` 헬퍼로 포커스 + 커서 복원.
- **앞으로 새 검색창을 만들 때**: 반드시 위 패턴 따르기. `onchange`, Enter-only, 검색 버튼 모두 사용 금지.

### 사이드바 구조
- **접기 버튼**: 사이드바 내부 우측상단 (`.sidebar-collapse-btn`, `position: absolute`, 아이콘 `✕`). 사이드바가 접히면 함께 화면 밖으로 이동하므로 자동 숨김.
- **펼치기 버튼**: 사이드바 외부 좌측상단 (`.sidebar-expand-btn`, `position: fixed`, 아이콘 `☰`). 기본 `display: none`, `.sidebar.collapsed ~ .sidebar-expand-btn { display: flex }`로 접혔을 때만 노출.
- **모바일**: `mobile-header`의 햄버거 SVG가 사이드바 열기. 모바일에선 `.sidebar-expand-btn`을 `display: none !important`로 숨김.
- **토글 로직**: `toggleSidebar()`가 `window.innerWidth <= 768` 분기 — 모바일은 `.open` 클래스 토글, 데스크톱은 `.collapsed` 클래스 토글 + localStorage 저장.
- **페이지 헤더 좌측 여백**: 기본 `margin-left: 0`, `.sidebar.collapsed ~ .main .page-header`일 때만 `60px` (펼치기 버튼 회피).

### 모바일 대응 패턴
- **대원칙**: 사용자가 모바일 전용 변경을 요청할 때는 `@media (max-width: 768px) { ... }` 안에서만 처리. 데스크톱에 영향 주지 말 것.
- **페이지 헤더**: 모바일에선 숨김 (`.page-header { display: none }`). `mobile-header`가 페이지명을 이미 제공.
- **리스트 → 카드뷰**: 모바일에서 테이블은 가독성 나쁨. 학생·결제 페이지는 테이블을 숨기고 카드뷰 표시.
  - 학생 카드뷰 구조: 좌측상단 체크박스, 우측상단 번호, 왼쪽 프로필 56px, 오른쪽 3줄(이름+학년 / 학교 / 담당T+요일). 속성명 없이 값만.
- **필터/버튼 다단 배치**: `.filter-sort-row`, `.page-action-buttons` 같은 wrapper에 데스크톱 `display: contents` + 모바일 `display: flex`. wrapper 자체는 데스크톱 레이아웃에 영향 없음.
- **반응형 테이블 (모달 내부)**: `data-label` 속성 + CSS `td:before { content: attr(data-label) }`로 레이블 표시 + `display: block`으로 세로 스택. 등록/퇴원 기록 수정 모달에서 사용.

### 탭 컴포넌트 통일
- 페이지 내 탭은 `.tab-btn.active` 스타일 사용 (결제 관리 / 학생 관리 뷰 전환 공통).
- 버튼 그룹 (`btn-primary`/`btn-outline` 조합)은 탭이 아니라 "모드 선택" 용도로만 쓸 것.

---

## 10. 기기 전환 자동화 (중요)

이 프로젝트는 여러 기기에서 교차 작업됨. Claude Code는 아래 규칙을 **자동으로** 수행한다.
(사용자용 명령어 가이드는 `WORKFLOW.md` 참고)

### 세션 시작 시 동작
사용자가 "시작할게" / "켰어" / "작업 시작" 등을 말하거나, 첫 요청이 들어올 때 **선제적으로**:
1. `git status` — 커밋 안 된 로컬 변경이 있으면 사용자에게 먼저 보고
2. `git pull origin main` — 원격 최신 반영
3. 결과를 1-2줄로 요약 보고 (변경 없으면 "원격과 동일, 최신입니다" 수준)

다만 이미 세션이 진행 중이고 사용자가 단순 요청만 하는 경우엔 굳이 매번 pull 하지 않음. 기기 전환/첫 요청 맥락일 때만.

### 세션 종료 시 동작
사용자가 "끝났어" / "마무리할게" / "다른 기기 옮길게" / "세션 끝내자" 등을 말하면:
1. `git status`로 변경된 파일 확인
2. 변경 목록 + 제안 커밋 메시지를 사용자에게 보여줌
3. 승인 후 `git add [지정 파일들] && git commit && git push origin main`
4. CLAUDE.md 자체의 갱신은 섹션 3의 규칙을 별도로 따름 (명시적 종료 의사 필수)

⚠️ `git add .` 또는 `git add -A` 지양. 바뀐 파일을 명시적으로 지정.

### WIP 상태로 기기 이동
사용자가 "덜 끝났는데 다른 기기 가야 돼" 같은 말을 하면:
- WIP 커밋(`git commit -am "WIP: [간단 설명]"`) 생성 후 push
- 다음 기기에서는 pull 후 이어서 작업 가능
- stash는 로컬 전용이라 기기 이동엔 쓸 수 없음을 명시

### 충돌 발생 시
`git pull` 중 충돌이 나면 사용자 혼자 마커(`<<<<<<<`) 손대지 않게 안내하고, Claude가 직접 분석·해결.
대부분 원인: 다른 기기에서 push 안 한 작업이 남아있음 → 이 가능성 먼저 의심.

### 패치 후 자동 푸시 (기본값)
사용자가 요청한 코드 수정이 끝나면 **매번** 자동으로 커밋 + 푸시한다. 사용자가 배포 URL로 바로 확인할 수 있도록 하기 위함.

흐름:
1. 수정 완료 → `node`로 script 문법 검증
2. 검증 통과 시 **자동으로** `git add [변경 파일들] && git commit && git push origin main`
3. 한 사용자 지시 안에 여러 수정이 있으면 **1개 커밋으로 묶어서** 푸시 (여러 커밋 지양)
4. 푸시 후 안내: "푸시 완료. GitHub Pages 반영까지 ~1분, 화면 그대로면 Cmd+Shift+R (하드 리프레시)"

커밋 메시지: 해당 턴의 수정 내용을 한국어로 1-3줄 요약. Co-Authored-By 라인 포함.

**푸시 보류하고 먼저 확인 권장해야 하는 경우** (Claude가 먼저 제안):
- 대규모 리팩토링·구조 변경
- 테스트가 어려운 복잡한 로직
- 사용자가 명시적으로 "로컬에서 먼저 확인할게"라고 말한 경우
- 문법 검증은 통과했지만 런타임 에러 가능성이 높아 보이는 경우

**CLAUDE.md 자체 변경은 섹션 3 규칙이 우선.** 사용자의 명시적 세션 종료 의사 없이 CLAUDE.md를 변경해서 푸시에 포함하지 않는다. (단, 이 섹션 10의 자동화 흐름에 따라 사용자가 명시적으로 요청한 CLAUDE.md 수정은 함께 푸시해도 됨)

---

## 11. 다음 세션 시작점

**최종 세션 날짜**: 2026-04-22. 이번 세션 커밋 1개 푸시 (`ef37db5 fix: 피드백 5종 반영 (사이드바/검색/모달/카드뷰)`). 이전 세션 최종 커밋은 `2452376`.

**세션 종료 맥락**: 사용자가 2026-04-22 세션에서 다른 컴퓨터로 이동 예정. 현재 세션 마무리하고 새 세션에서 이어서 작업.

---

### 세션 시작 시 즉시 할 일 (순서대로)

1. **git pull** — 기기 이동 후 로컬/원격 동기화 (섹션 10 규칙). 이 시점 기준 원격 최신 커밋은 `ef37db5`.
2. **사용자에게 인사 + 테스트 진행 상황 확인**: 이번 세션의 피드백 수정이 배포되었음. 사용자가 배포 URL에서 테스트 시작할 준비가 되었는지 확인.
3. **아래 "검증이 필요한 변경사항 목록"을 사용자에게 정리해서 보여주기** — 항목별로 체크할 수 있도록.
4. **피드백 반영**: 버그/개선 요청 처리. 패치 후 자동 푸시 (섹션 10 규칙).
5. **미착수 최우선 과제 진입**: 학교 DB + 관리 대분류 메뉴 재구성. 섹션 7의 🔲 항목 참고 (사용자 원문 그대로 인용되어 있음 — 축약 금지).

⚠️ **주의**: 사용자가 2026-04-22 세션에서 "따로 언급을 안하는 항목은 지금 상태가 마음에 드는 거라고 생각하면 돼"라고 명시함. 따라서 2026-04-21 세션의 검증 목록 중 2026-04-22 피드백에서 재언급되지 않은 항목은 **통과**로 간주. 재확인 요청 금지. 아래 목록은 2026-04-22 세션에서 새로 변경된 것만 포함.

---

### 검증이 필요한 변경사항 목록 (2026-04-22 세션 배포분, 사용자 테스트 대기)

> 사용자가 다른 컴퓨터에서 배포 URL(https://beybusiness-bit.github.io/pongdang-manager/)로 접속해 확인 예정. **하드 리프레시 필요** (Cmd/Ctrl + Shift + R).

**🗂 사이드바 접기 버튼 미니멀화 (사용자 요청 #1)**
- 사이드바 펼친 상태에서: 접기 버튼이 **테두리·배경 없이** 사이드바 우상단에 X 글리프만 떠있는 것처럼 보여야 함
- 기존 흰 버튼 박스 + 테두리 → 투명 배경 + 텍스트 색 `--text3`
- 호버 시 색만 진해짐 (`--text`)
- 모바일/펼치기 버튼(☰)은 변경 없음

**🔍 검색 한글 IME 근본 해결 재검증 (사용자 요청 #2) — 최중요**
- 2026-04-22 세션에서 composition-aware 방식을 폐기하고 **shell+body 구조**로 전환.
- 테스트 대상 4곳 모두에서 한글 "김소예" 같은 조합 이름 타이핑:
  - [ ] 학생 관리 검색창: 조합 안 깨지고, 커서 안 튕기고, 실시간 필터링
  - [ ] 교재 관리 검색창
  - [ ] 월별등록대장 월 검색창 (숫자 검색이라 IME 이슈 자체는 덜하지만, 리스트 재렌더 정상 확인)
  - [ ] 결제기록 학생명 검색창
- 추가 체크: 검색 중에도 **필터/정렬 select**가 상태를 유지하는지 (shell은 재렌더 안 되므로 select 값 유지되어야 함)
- 추가 체크: **페이지네이션 버튼**, **체크박스 선택**, **필터/정렬 변경** 시 리스트만 바뀌고 검색 input은 그대로 있는지

**🪟 모든 추가/수정 모달 스티키 헤더 (사용자 요청 #3)**
- 모든 모달에서 헤더가 스크롤에 관계없이 상단 고정되어야 함
- 좌측에 모달 제목, 우측에 액션 버튼 (취소/저장/닫기 등)
- 테스트 대상 (정적 HTML 11개 모달):
  - [ ] 학생 추가/수정 모달 (`modal-student-form`)
  - [ ] 교재 추가/수정 모달 (`modal-textbook-form`)
  - [ ] 교재 상세 모달 (`modal-textbook-detail`)
  - [ ] 학생 상세 모달 (`modal-student-detail`)
  - [ ] 교재 배정 모달 (`modal-assign-textbook`)
  - [ ] 등록/퇴원 기록 수정 모달 (`modal-enrollment-record`)
  - [ ] CSV 대량 업로드 모달 (`modal-csv-upload`)
  - [ ] 결제 추가/수정 모달 (`modal-payment-form`)
  - [ ] 공지사항 추가/수정 모달 (`modal-notice`)
  - [ ] 월 추가 모달 (`modal-add-ledger-month`)
  - [ ] 결제 CSV 업로드 모달 (`modal-payment-csv-upload`)
- 체크 포인트:
  - 긴 폼에서 스크롤 시 제목·액션 버튼이 **항상 보이는지**
  - 저장/취소/닫기 버튼이 **여전히 작동**하는지 (폼 제출 포함 — `form="student-form"` 등)
  - 제목 동적 변경이 되는 모달 (`학생 추가` ↔ `학생 수정` 등) 정상 표시

**🔲 학생 모바일 카드뷰 전체선택 체크박스 (사용자 요청 #4)**
- [ ] 모바일에서 학생 목록 카드뷰 **위**에 "전체 선택" 라벨 + 체크박스가 한 줄로 뜨는지
- [ ] 체크박스 클릭 시 현재 페이지 학생 전원 선택 / 재클릭 시 해제
- [ ] 데스크톱에서는 이 헤더가 보이지 않는지 (기존 테이블 유지)

**📱 학생 모바일 카드뷰 레이아웃 변경 (사용자 요청 #5)**
- [ ] 체크박스가 카드 **우측 상단**에 위치
- [ ] 학생 이름 옆에 `(학생번호)` 괄호 표기 (별도 우상단 번호 삭제)
- [ ] 카드 내 한 줄에 여러 요소가 있을 때 요소 사이 여백이 넓음 (`gap: 14px`)
- [ ] 담당선생님과 요일 사이에 **콤마 없음**, 여백으로만 구분

**⚠️ 구조 변경으로 인한 잠재적 회귀 (우선 점검)**
2026-04-22 세션은 렌더링 파이프라인을 4곳에서 재구성했으므로 일반 동작 회귀 가능성 있음:
- [ ] 학생/교재/결제 페이지 **진입 직후** 리스트가 정상 표시되는지
- [ ] 학생 체크박스 선택 → 일괄 작업 바 (일괄 수정/선택 해제) 노출 확인
- [ ] 결제기록 체크박스 선택 → 선택 삭제 버튼 (모바일만) / 일반 동작 확인
- [ ] 월별등록대장 월 탭 전환이 즉시 반영되고 데이터가 그 달로 바뀌는지
- [ ] 월별등록대장 "+ 월 추가" 버튼으로 월을 추가하면 그 월이 자동 선택되는지
- [ ] 각 페이지 페이지네이션 (이전/다음/숫자) 동작 및 "페이지당 N개" 셀렉트 동작
- [ ] 학생 CRUD (추가/수정/삭제) 후 목록이 최신으로 갱신되는지
- [ ] 교재 CRUD 후 동일
- [ ] 결제 CRUD 후 동일 (+ 월별등록대장도 함께 갱신되는지 — 같은 paymentsData를 공유하므로)
- [ ] 학생 관리에서 뷰 탭 전환 (일반 ↔ 교재 사용 현황) 정상
- [ ] 결제 관리에서 탭 전환 (월별등록대장 ↔ 결제기록) 정상
- [ ] CSV 업로드 → 완료 후 목록 갱신 정상
- [ ] 권한별 (학원장/선생님/보조쌤) 읽기·쓰기 분기 동작 여부 (버튼 노출 여부)

---

### 미착수 최우선 과제: 학교 DB + 관리 대분류 메뉴 재구성

섹션 7의 🔲 "학교 DB + 관리 대분류 메뉴 재구성" 항목에 상세 전개되어 있음 (사용자 원문 포함). 요약:

1. **Schools DB는 이미 스키마 존재** (`id, name, type(초/중/고)`). 관리 UI만 새로 구축.
2. **새 메뉴 페이지 3개 추가**: 수강반 / 학교 / 선생님 — `MENUS`의 `manage-group.children`에 편입.
3. **메뉴명에서 "관리" 일괄 제거**: 학생 관리 → 학생, 교재 관리 → 교재, 결제 관리 → 결제, 급여 관리 → 급여 (사용자 원문: "관리 대분류에 속하는 모든 메뉴명에서 '관리'를 빼줘ㅎㅎㅎ").
4. **학교 선택 → 학교급 자동 세팅**: 학생 폼에서 `student-school` 선택 시 `schoolsData.find(...).type`을 파생. 학교급 별도 선택 UI 제거 또는 readonly 전환.
5. **적용 범위**: 사용자가 명시적으로 "이 요소가 노출되거나 연결되거나 영향을 미치는 모든 곳에 동일하게 적용" 요청. 학생 폼, 학생 목록(desktop+mobile), 상세 모달, 결제 모달, CSV 업로드까지 일괄 점검.

⚠️ `schoolType`은 여전히 **DB에 저장하지 않음**. `grade` 첫 글자에서 파생하는 기존 규칙 유지. 학교 선택 시 UI상 자동 표시되는 것과 실제 저장 데이터를 혼동하지 말 것.

---

### 코드만 봐선 파악 안 되는 맥락 (새 세션에서 반드시 참고)

- **사용자 환경**: 2026-04-22 기준 다른 컴퓨터로 이동. 새 세션 시작 시 `git pull origin main` 필수. 최신 커밋 `ef37db5`가 리모트에 있음.
- **사용자가 선호하는 피드백 루프**: Claude가 수정 → 자동 푸시 → 사용자가 배포 URL에서 확인 → 피드백. "로컬에서 확인할게"라고 명시할 때만 푸시 보류 (섹션 10 참고).
- **`.claude/` 폴더는 untracked**: 세션 상태 파일이라 레포에 포함 X. 다음에 `.gitignore`에 추가 권장 (아직 미작업).
- **사용자 피드백 스타일**: 사용자는 번호 매긴 리스트로 한 번에 여러 개 지시하는 걸 선호. 각 번호는 **축약·생략·자의적 해석 금지**. "따로 언급 안 한 건 마음에 든 것"이라고 명시하므로 직접 말한 것만 건드리면 됨.
- **검색 구현 역사 (요약)**: pongdang-manager 검색은 네 번 바뀜.
  1. `renderPreservingFocus` + onchange pending (초기)
  2. Enter/검색 버튼 방식 (2026-04-21 도중 시도)
  3. composition-aware 실시간 방식 (2026-04-21 최종, 여전히 한글 깨짐)
  4. **shell+body 분리 (2026-04-22 최종, 현재)** — 검색 input DOM이 재생성되지 않는 구조. bey-manager의 정적 input 패턴을 pongdang의 복잡한 페이지 구조에 맞게 적용한 결과. 이후 새 검색창 만들 때는 반드시 이 패턴 따르기 (shell 고정 + body 재렌더).
- **`bey-manager` 프로젝트 참조 가능**: `/Users/bey/projects/bey-manager/index.html`. 시간표 검색 구현은 입력 DOM이 정적 HTML에 있어서 애초에 재생성 이슈가 없음. pongdang은 전체 페이지를 JS로 생성하는 구조라 shell/body를 명시적으로 분리해야 했음.
- **모달 스티키 헤더의 런타임 마이그레이션**: `migrateModalHeaders()` 함수가 DOMContentLoaded에서 1회 실행. 새 모달 HTML을 추가할 때는 이 마이그레이션이 잘 동작하는지 확인 필요:
  - 단순 패턴: `<div class="modal-title" id="my-title">제목</div>` + `<div class="modal-footer"><button>...</button></div>` → 자동으로 헤더에 통합됨.
  - 이미 flex인 패턴: `<div class="modal-title" style="display: flex; ...">`<span>제목</span><div>...</div>` → 인라인 스타일 제거 후 클래스만 부여.
  - 런타임에 innerHTML로 생성되는 모달은 이 마이그레이션을 놓칠 수 있음. 정적 모달을 쓰는 것을 권장.
- **`renderPreservingFocus` 함수는 데드코드**: 이제 호출처 없음. 삭제해도 무방하나 안전을 위해 일단 보존.
- **`.bulk-actions-bar` 위치 이동**: 기존에는 탭과 page-actions 사이 → 현재는 page-actions 아래 (list body 안). 선택 시에만 보이므로 사용자 체감 영향은 작지만 명시적 변경 사항임.
- **테스트 환경 전환**: 사용자가 모바일/데스크톱 양쪽에서 확인. 모바일은 주로 iOS Safari 가정.
