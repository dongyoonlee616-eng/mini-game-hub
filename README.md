# Mini Game Hub (MGH)

Mini Game Hub, 줄여서 **MGH**는 모바일 기기 하나로 여러 명이 함께 즐길 수 있는 웹 미니게임 모음 사이트입니다.  
플래시 게임 사이트처럼 메인 메뉴에서 게임을 고르고 바로 플레이할 수 있는 구조를 목표로 합니다.

## 프로젝트 컨셉

- 밝은 흰색 계열 배경
- 검정 계열 포인트 컬러
- 모바일 중심 UI
- DB 없이 브라우저에서 바로 실행
- 게임별 HTML 파일 분리

## 현재 버전

```txt
v0.1.0 Starter
- 메인 메뉴 페이지
- 반응속도 테스트
- 클릭 속도 테스트
- 숫자 야구
- 공통 CSS / JS 구조
```

## 폴더 구조

```txt
mini-game-hub/
│
├─ README.md
│
├─ public/
│  ├─ index.html
│  │
│  ├─ reaction/
│  │  └─ reaction.html
│  │
│  ├─ clicker/
│  │  └─ clicker.html
│  │
│  ├─ number-baseball/
│  │  └─ number-baseball.html
│  │
│  ├─ css/
│  │  └─ style.css
│  │
│  ├─ js/
│  │  ├─ main.js
│  │  ├─ reaction.js
│  │  ├─ clicker.js
│  │  └─ number-baseball.js
│  │
│  └─ assets/
│     ├─ images/
│     └─ icons/
```

## 실행 방법

DB나 서버 없이 정적 파일로 실행할 수 있습니다.

1. 압축 해제
2. `public/index.html` 실행
3. 모바일 화면 기준으로 확인

VS Code를 사용한다면 Live Server 확장 프로그램으로 `public/index.html`을 열면 편합니다.

## 기술 스택

- HTML
- CSS
- JavaScript
- localStorage
- Responsive Web Design

## 다음 작업 후보

```txt
[v0.1.1]
- 게임 UI 세부 조정
- 모바일 터치감 개선
- 게임별 안내 화면 강화

[v0.2.0]
- 카드 뒤집기 게임 추가
- 랜덤 벌칙 뽑기 추가
- 진실 혹은 도전 게임 추가
```
