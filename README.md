# Mini Game Hub

**Mini Game Hub(MGH)**는 모바일 기기 하나로 여러 명이 함께 즐길 수 있는 미니게임 모음 웹사이트입니다.

플래시 게임 사이트처럼 여러 게임을 한곳에 모아두는 것을 목표로 제작했으며, 싱글 플레이 게임과 멀티 플레이 게임을 나누어 선택할 수 있도록 구성했습니다.

## 배포 링크

```txt
https://dongyoonlee616-eng.github.io/mini-game-hub/
```

## 프로젝트 소개

MGH는 별도의 서버나 데이터베이스 없이 브라우저에서 실행되는 정적 웹 프로젝트입니다.

HTML, CSS, JavaScript만 사용하여 제작했으며, 모바일 화면에서 플레이하기 좋도록 전체 UI를 모바일 중심으로 설계했습니다.

사용자는 설치나 회원가입 없이 웹사이트에 접속해 바로 미니게임을 플레이할 수 있습니다.

## 주요 기능

- 모바일 중심 미니게임 허브
- 싱글 플레이 / 멀티 플레이 게임 구분
- 게임 카드 자동 생성 구조
- 게임별 HTML, CSS, JS 분리
- 밝은 배경과 검정 포인트 컬러 기반 UI
- GitHub Pages 정적 배포
- DB 없이 브라우저에서 실행
- 한 기기를 여러 명이 함께 사용하는 로컬 멀티 플레이 방식 지원

## 포함된 게임

### 싱글 플레이

| 게임 | 설명 |
|---|---|
| 반응속도 테스트 | 화면이 바뀌는 순간 빠르게 터치해 반응속도를 측정하는 게임 |
| 카드 뒤집기 | 카드 위치를 기억해 같은 그림의 카드를 맞추는 기억력 게임 |
| 클릭 속도 테스트 | 시작하는 순간부터 5초 동안 빠르게 클릭하여 CPU를 측정하는 게임 |

### 멀티 플레이

| 게임 | 설명 |
|---|---|
| 클릭 속도 테스트 | 제한 시간 동안 최대한 많이 터치해 기록을 비교하는 게임 |
| 숫자 야구 | 3자리 숫자를 추리해 Strike와 Ball 힌트로 정답을 맞추는 게임 |
| 양면 탁구 | 한 기기를 사이에 두고 위아래에서 패들을 움직이며 공을 주고받는 2인용 게임 |
| 턴제 카드 뒤집기 | 두 명이 번갈아 카드를 뒤집고 같은 그림을 맞춰 점수를 얻는 턴제 게임 |

## 기술 스택

```txt
HTML
CSS
JavaScript
GitHub Pages
```

## 프로젝트 구조

```txt
mini-game-hub/
├─ README.md
├─ CHANGELOG.md
├─ .github/
│  └─ workflows/
│     └─ pages.yml
└─ public/
   ├─ index.html
   ├─ games/
   │  ├─ reaction.html
   │  ├─ clicker.html
   │  ├─ number-baseball.html
   │  ├─ memory-card.html
   │  ├─ two-player-pong.html
   │  └─ memory-card-multi.html
   ├─ css/
   │  ├─ style.css
   │  ├─ reaction.css
   │  ├─ clicker.css
   │  ├─ number-baseball.css
   │  ├─ memory-card.css
   │  ├─ two-player-pong.css
   │  └─ memory-card-multi.css
   ├─ js/
   │  ├─ games-data.js
   │  ├─ main.js
   │  ├─ reaction.js
   │  ├─ clicker.js
   │  ├─ number-baseball.js
   │  ├─ memory-card.js
   │  ├─ two-player-pong.js
   │  └─ memory-card-multi.js
   └─ assets/
      ├─ images/
      └─ icons/
```

## 개발 방향

MGH는 게임을 계속 추가하면서 확장하는 프로젝트입니다.

새 게임을 추가할 때는 다음 구조를 기준으로 추가합니다.

```txt
HTML: public/games/게임이름.html
CSS: public/css/게임이름.css
JS: public/js/게임이름.js
게임 데이터: public/js/games-data.js
```

메인 메뉴의 게임 카드는 `games-data.js`에 등록된 데이터를 바탕으로 자동 생성됩니다.

## 버전

현재 버전: **v1.0.0**

## License

This project is licensed under the MIT License.

누구나 자유롭게 사용, 수정, 배포할 수 있습니다.  
자세한 내용은 `LICENSE` 파일을 참고하세요.

## 패치노트

해당 사이트의 패치노트는 [CHANGELOG.md](CHANGELOG.md)를 참고해주세요.