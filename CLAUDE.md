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

---

## 10. 다음 세션 시작점

**현재 상황**: 7단계 결제 관리의 월별등록대장 구현이 완료되었고, 사용자가 직접 테스트 후 피드백을 줄 차례.

**다음 세션에서 할 일**:
1. 사용자가 직전 패치에 대해 피드백을 주면, 그에 따라 버그 수정 및 추가 개선 진행
2. 특히 다음 항목들이 정상 동작하는지 사용자 확인 필요:
   - 학생 추가 버튼 → 학생 추가 모달 (이전 세션에서 `</script>` 바깥 코드 제거로 해결됐을 가능성)
   - 결제 모달의 신입 토글 ON → "+ 학생 추가" 버튼 클릭 → 학생 추가 모달 중첩 (동일 원인이었을 가능성)
   - 월별등록대장에 더미 결제 데이터가 정상 표시되는지 (32개 결제, 31명 학생, 학교급별 그룹핑)
   - 그룹별 키컬러가 디자인 의도대로 잘 보이는지
3. 7단계 결제 관리에 추가로 필요한 기능이 있는지 확인 후 마무리
4. 8단계(근무일지) 진입 여부 결정
