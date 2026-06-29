# Mini Game Hub

**Mini Game Hub(MGH)**는 모바일 기기 하나로 여러 명이 함께 즐길 수 있는 미니게임 모음 웹사이트입니다.

플래시 게임 사이트처럼 여러 게임을 한곳에 모아두는 것을 목표로 제작했으며, 싱글 플레이 게임과 멀티 플레이 게임을 나누어 선택할 수 있도록 구성했습니다.

## 배포 링크

https://dongyoonlee616-eng.github.io/mini-game-hub/

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
- 한 기기를 여러 명이 함께 사용하는 멀티 플레이 방식 지원

## 포함된 게임

## Included Games

### Single Player

| No. | Game | Description |
|---|---|---|
| 01 | 반응 속도 테스트 | 화면 색이 바뀌는 순간 빠르게 터치하는 반응 속도 게임 |
| 02 | 클릭 속도 테스트 | 제한 시간 동안 최대한 많이 터치하는 CPS 게임 |
| 03 | 숫자 야구 | 힌트를 보고 3자리 숫자를 맞히는 추리 게임 |
| 04 | 카드 뒤집기 | 같은 그림의 카드를 찾아 모두 맞히는 기억력 게임 |
| 05 | 색깔 기억하기 | 표시된 색깔 순서를 기억하고 따라 누르는 기억력 게임 |
| 06 | 10초 맞추기 | 시간을 보지 않고 정확히 10초에 가깝게 멈추는 감각 게임 |
| 07 | 빠른 계산 | 제한 시간 안에 계산 문제를 최대한 많이 푸는 계산 게임 |
| 08 | 폭탄 피하기 | 떨어지는 폭탄을 피하며 오래 버티는 회피 게임 |
| 09 | 목표 숫자 만들기 | 숫자 카드와 연산자를 사용해 목표 숫자를 만드는 계산 퍼즐 |
| 10 | 순간 판단 | 단어 뜻과 글자색을 빠르게 구분해 정답을 고르는 판단 게임 |

### Multiplayer

| No. | Game | Description |
|---|---|---|
| 01 | 양면 탁구 | 한 기기에서 위아래로 플레이하는 2인용 탁구 게임 |
| 02 | 턴제 카드 뒤집기 | 두 명이 번갈아 카드를 뒤집어 점수를 얻는 기억력 대결 |
| 03 | 색깔 기억하기 대결 | 각자 색깔 순서를 기억하고 따라 누르는 기억력 대결 |
| 04 | 순발력 대결 | 랜덤 신호가 뜨는 순간 먼저 누르는 반응 속도 대결 |
| 05 | 버튼 함정 대결 | 번갈아 버튼을 선택하며 함정을 피하는 턴제 대결 |
| 06 | 계산 대결 | 같은 계산 문제를 보고 각자 키패드로 빠르게 정답을 입력하는 대결 |
| 07 | 영역 점령전 | 캐릭터를 움직여 지나간 땅을 자신의 색으로 바꾸는 영역 대결 |
| 08 | 같은 그림 찾기 대결 | 양쪽 원판에서 하나만 겹치는 그림을 먼저 찾는 관찰력 대결 |
| 09 | 실시간 해전 | 함선을 배치한 뒤 턴제로 상대 함선을 공격하는 해전 게임 |
| 10 | 다트 대결 | 가로 / 세로 타이밍을 맞춰 다트를 던지는 턴제 다트 게임 |

## 기술 스택

- HTML
- CSS
- JavaScript
- GitHub Pages

## 프로젝트 구조

```txt
mini-game-hub/
├─ README.md
├─ CHANGELOG.md
├─ LICENSE
├─ .github/
│  └─ workflows/
│     ├─ pages.yml
│     └─ discord.yml
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

현재 버전: **v1.1.0**

## 버전 관리 기준

Mini Game Hub는 다음 기준으로 버전을 관리합니다.

```txt
MAJOR.MINOR.PATCH
```

- `MAJOR`: 사이트 구조, 개발 방향, 핵심 시스템이 크게 바뀌는 대규모 업데이트
- `MINOR`: 정해둔 게임 개수 목표를 달성한 뒤, 여러 게임을 허브에 한 번에 추가하는 업데이트
- `PATCH`: 이미 배포된 게임의 버그 수정, UI 조정, 밸런스 수정, 조작감 개선

## Version 1.1.0 Goal

Version 1.1.0 목표였던 싱글 플레이 10개, 멀티 플레이 10개 구성이 완료되었습니다.

```txt
Single Player: 10 / 10
Multiplayer: 10 / 10
Total Games: 20
```

## License

This project is licensed under the MIT License.

누구나 자유롭게 사용, 배포할 수 있습니다.  
자세한 내용은 `LICENSE` 파일을 참고하세요.

## 패치노트

해당 사이트의 패치노트는 [CHANGELOG.md](CHANGELOG.md)를 참고해주세요.
