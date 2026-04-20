# 기기 전환 워크플로우

여러 기기(집/학원 등)에서 이 프로젝트를 교차 작업할 때 참고하는 문서.

---

## 0. 초보자 모드 — Claude에게 맡기기 (권장)

매번 명령어 외울 필요 없음. Claude Code 세션에서 아래 표현만 쓰면 Claude가 알아서 처리함.

| 상황 | 사용자가 할 말 | Claude가 하는 일 |
|------|----------------|------------------|
| 작업 시작 | "시작할게" / "켰어" / 그냥 첫 요청 | `git status` + `git pull` → 최신 상태로 맞춰줌 |
| 작업 종료 | "끝났어" / "마무리" / "다른 기기 옮길게" | 변경사항 보여주고 → 커밋 메시지 제안 → 승인 후 push |
| 충돌 발생 | "충돌 났다는데?" | 상황 분석 + 해결 방법 안내 |
| WIP 상태로 이동 | "아직 덜 끝났는데 다른 기기 가야 돼" | WIP 커밋 만들어서 push |

이 규칙은 `CLAUDE.md` 섹션 11에 명시돼있어서 어느 기기에서 Claude Code를 켜든 자동으로 적용됨.

---

## 1. 수동 방법 (Claude 없이 직접 할 때)

### 1-1. 새 기기에서 최초 1회

```bash
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/beybusiness-bit/pongdang-manager.git
cd pongdang-manager
git config user.name "백은영"
git config user.email "baekeun0@gmail.com"
```

GitHub 인증: 맥은 처음 push 시 브라우저 OAuth 창이 뜸. 윈도우도 유사.

### 1-2. 세션 시작 시 (항상 이것부터)

```bash
cd ~/projects/pongdang-manager
git status        # 이전에 커밋 안 한 거 있는지 확인
git pull origin main
```

- `Already up to date.` → 바로 작업 시작
- 뭔가 받아졌으면 Chrome에서 `index.html` 새로고침

### 1-3. 세션 종료 시 (항상 이것으로 끝)

```bash
git status                       # 뭐가 바뀌었는지 확인
git add index.html CLAUDE.md     # 바뀐 파일만 지정
git commit -m "작업 내용 한 줄"
git push origin main
```

⚠️ **push 안 하고 기기 닫으면 그 작업은 다른 기기에서 못 봄.**

### 1-4. 자주 생기는 상황

**(a) pull 했더니 충돌**
```
CONFLICT (content): Merge conflict in index.html
```
→ 혼자 `<<<<<<<` 마커 손대지 말고 Claude에게 "충돌 났어"라고 말하기.

**(b) 기기 이동 전 push를 깜빡함**
- 이전 기기로 돌아가서 push 하는 게 최선
- 불가능하면 병합 작업 필요 (Claude에게 도움 요청)

**(c) 덜 끝난 작업을 다른 기기로 가져가야 함**
```bash
git commit -am "WIP: 작업중"
git push origin main
```
→ WIP 커밋으로 올려두고, 다음 기기에서 `git pull` 후 이어서 작업.
(stash는 로컬에만 저장돼서 기기 이동에 쓸 수 없음)

---

## 2. 절대 하지 말 것

- ❌ **GitHub 웹에서 "Add files via upload"로 파일 업로드** — 커밋 히스토리가 오염됨. 반드시 `git push`로.
- ❌ 두 기기에서 동시에 같은 파일 편집 → 충돌 폭탄
- ❌ push 없이 다른 기기에서 이어서 편집
- ❌ `git push --force` (특히 `main`) — 다른 기기의 작업이 통째로 날아감

---

## 3. 치트시트

| 언제 | 명령 |
|------|------|
| 새 기기 최초 1회 | `git clone https://github.com/beybusiness-bit/pongdang-manager.git` |
| 매 세션 시작 | `git pull origin main` |
| 매 세션 종료 | `git add ... && git commit -m "..." && git push origin main` |
| 급한 기기 이동 | `git commit -am "WIP" && git push` |

---

## 4. 레포 정보

- GitHub: https://github.com/beybusiness-bit/pongdang-manager
- 배포 URL: https://beybusiness-bit.github.io/pongdang-manager/
- 작업 폴더 권장 위치: `~/projects/pongdang-manager/` (Downloads 아님)
