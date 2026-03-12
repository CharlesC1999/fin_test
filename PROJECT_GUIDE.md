# 專案架構與功能說明

## 1. 專案簡介

此專案是一個使用 **Vite + Vanilla JavaScript** 建立的前端單頁應用（SPA），主要用途是提供一個可在手機與桌面瀏覽器上操作的 **題庫測驗系統**。

使用者可從題庫中：

- 依分類篩選題目
- 自訂本次測驗題數
- 開始一般測驗或錯題複習模式
- 作答並即時查看對錯
- 在測驗結束後查看分數、正確率與答題統計

本專案未使用 React、Vue 或其他前端框架，所有互動都集中在原生 JavaScript 檔案中實作。

---

## 2. 技術棧

### 前端技術

- **Vite 7**：開發伺服器、打包工具、靜態資源處理
- **Vanilla JavaScript (ES Modules)**：畫面渲染、狀態管理、事件綁定
- **CSS**：畫面樣式、動畫、RWD
- **HTML**：入口頁與掛載節點

### 資料來源

- 題庫資料來自 `public/data_table.json`
- 啟動時由前端使用 `fetch()` 載入

### 本機儲存

- 使用 `localStorage` 記錄錯題清單
- 儲存 key：`quiz_wrong_questions`

### 部署方式

- 透過 **GitHub Actions** 自動建置
- 發布目標為 **GitHub Pages**

---

## 3. 專案目錄結構

```text
fin_test/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml          # GitHub Pages 自動部署流程
├─ public/
│  ├─ data_table.json        # 題庫資料
│  └─ favicon.svg            # 靜態圖示
├─ src/
│  ├─ main.js                # 應用主程式，包含狀態、渲染、事件與資料處理
│  └─ style.css              # 全部畫面樣式與動畫
├─ dist/                     # 打包輸出結果
├─ index.html                # 應用入口 HTML
├─ package.json              # 專案腳本與依賴
├─ package-lock.json         # npm 鎖定版本
├─ vite.config.js            # Vite 設定，含 GitHub Pages base path
└─ PROJECT_GUIDE.md          # 本文件
```

---

## 4. 各檔案職責

### `index.html`

用途：

- 定義網頁基本 `meta`
- 建立 `#app` 掛載點
- 載入 `src/main.js`

這個專案沒有多頁面路由，整個 UI 都由 JavaScript 動態寫入 `#app`。

### `src/main.js`

此檔案是專案核心，負責：

- 全域狀態管理
- 題庫資料清洗與轉換
- 題目篩選
- 錯題模式管理
- 測驗流程控制
- 畫面渲染
- 點擊事件派發
- `localStorage` 錯題同步

這是一個「單檔式應用核心」，目前專案的大部分商業邏輯都集中在這裡。

### `src/style.css`

負責所有視覺與互動樣式，包括：

- 首頁卡片與測驗卡片
- 篩選器面板
- 題數調整器
- 選項卡片狀態
- 作答結果頁
- 動畫效果
- 手機與桌面版 RWD

### `public/data_table.json`

儲存完整題庫資料。此檔不經由打包器轉譯，會原樣被複製到輸出目錄中，並由瀏覽器在執行時載入。

### `vite.config.js`

目前最重要的設定是：

- `base: "/fin_test/"`

這代表專案預設是部署在 GitHub Pages 的子路徑 `/fin_test/` 下，而不是網站根目錄 `/`。

### `.github/workflows/deploy.yml`

此檔定義 CI/CD 流程：

1. push 到 `main`
2. 安裝 Node.js 20
3. 執行 `npm ci`
4. 執行 `npm run build`
5. 上傳 `dist`
6. 發布到 GitHub Pages

---

## 5. 功能架構說明

### 5.1 題庫載入流程

啟動流程如下：

1. 畫面先進入 loading 狀態
2. 從 `localStorage` 讀取錯題 ID
3. 使用 `fetch()` 載入 `data_table.json`
4. 透過 `normalizeQuestions()` 清洗資料
5. 產生可用題目清單
6. 呼叫 `render()` 輸出首頁

### 5.2 狀態管理

專案使用一個 `state` 物件集中保存狀態，主要欄位包括：

- `allQuestions`：完整題庫
- `questions`：目前篩選後或本次作答使用的題目
- `started`：是否開始測驗
- `finished`：是否完成測驗
- `currentIndex`：目前題號索引
- `selectedAnswers`：目前已選答案
- `submitted`：本題是否已送出
- `score`：目前分數
- `correctCount`：答對題數
- `wrongCount`：答錯題數
- `loading`：是否正在載入資料
- `error`：載入失敗或資料異常訊息
- `selectedCategories`：目前已選分類
- `wrongQuestionIds`：錯題題目 ID
- `playMode`：`all` 或 `wrong`
- `questionLimit`：本次題數上限

這種做法簡單直接，適合小型專案，但若功能再擴充，建議拆分模組。

### 5.3 首頁功能

首頁提供以下功能：

- 顯示目前可作答題數
- 顯示錯題數量
- 切換一般模式 / 錯題模式
- 清除錯題紀錄
- 展開或收合分類篩選面板
- 勾選題目分類
- 清除分類條件
- 調整本次題數
- 開始測驗
- 重新隨機抽題

### 5.4 分類篩選機制

分類相關邏輯主要由以下函式組成：

- `categories()`：從題庫中取出所有分類
- `filteredQuestions()`：依據分類與模式產生題目清單
- `toggleCategory()`：切換單一分類
- `clearCategories()`：清空分類
- `syncFilteredQuestions()`：同步篩選後結果並重設執行狀態

### 5.5 錯題模式

錯題模式是本專案的重要功能之一。

相關邏輯：

- 答錯時，題目 ID 寫入 `wrongQuestionIds`
- 答對時，若該題曾是錯題，會自錯題清單移除
- 錯題資料會持久化到 `localStorage`
- 切換為 `wrong` 模式時，只顯示錯題清單中的題目

相關函式：

- `loadWrongQuestionIds()`
- `persistWrongQuestionIds()`
- `rememberWrongQuestion()`
- `forgetWrongQuestion()`
- `clearWrongQuestions()`
- `setPlayMode()`

### 5.6 測驗作答流程

作答流程如下：

1. `restartGame()` 建立本次題目集
2. 題目會先經過 `shuffleQuestions()` 隨機排序
3. 再依 `questionLimit` 截取指定數量
4. 使用者點選選項
5. `toggleAnswer()` 更新當前選擇
6. `submitAnswer()` 判定正確與否
7. 顯示正確/錯誤狀態
8. `nextQuestion()` 進入下一題
9. 最後一題完成後切到結果頁

### 5.7 單選 / 多選判斷

系統會根據：

- `answer_type`
- 或 `answer.length > 1`

來判斷題目是單選或多選。

多選題可累積勾選，多個答案都正確才算答對。

### 5.8 成績與結果頁

結果頁會顯示：

- 總分
- 答對題數
- 答錯題數
- 正確率
- 本次總題數

並提供：

- 回首頁
- 重新開始
- 再次隨機抽題

---

## 6. 畫面架構

此專案大致可分為三種畫面狀態：

### 6.1 首頁 `renderHome()`

內容包含：

- 標題區
- 錯題工具列
- 分類篩選面板
- 題數調整器
- 開始 / 隨機按鈕
- 狀態訊息

### 6.2 作答頁 `renderQuiz()`

內容包含：

- 題號與分數
- 進度條
- 題目本體
- 題目標籤（分類、難度）
- 選項列表
- 送出、下一題、回首頁等操作按鈕

### 6.3 結果頁 `renderResult()`

內容包含：

- 完成標題
- 圓形分數區
- 統計卡片
- 導航操作按鈕

---

## 7. 資料格式說明

`public/data_table.json` 中每一筆題目資料大致包含以下欄位：

```json
{
  "id": "1",
  "division": "法金授信管理處",
  "department": "法金審查部",
  "difficulty": "低",
  "type": "授信法規",
  "answer": [1],
  "answer_type": "單選",
  "question": "題目文字",
  "avalible": "海外全適用",
  "options": ["選項 1", "選項 2", "選項 3", "選項 4"]
}
```

### 重要欄位說明

- `id`：題目唯一識別值
- `type`：分類名稱
- `difficulty`：難度標記
- `question`：題目文字
- `options`：選項陣列
- `answer`：正確答案索引陣列
- `answer_type`：單選或多選

### 資料清洗規則

`normalizeQuestions()` 會過濾掉不完整資料，例如：

- 沒有題目文字
- 選項數量不足
- 沒有答案

並將欄位標準化，例如：

- `id` 一律轉為字串
- `options` 轉為字串並去除空白
- `answer` 轉為數字陣列並排序

---

## 8. 建立與啟動方式

### 8.1 環境需求

建議版本：

- **Node.js 20 以上**
- **npm 10 以上**

可先確認：

```bash
node -v
npm -v
```

### 8.2 安裝依賴

```bash
npm install
```

或使用鎖定版本安裝：

```bash
npm ci
```

### 8.3 本機開發

```bash
npm run dev
```

啟動後 Vite 會提供本機開發網址，通常是：

```text
http://localhost:5173/
```

### 8.4 正式建置

```bash
npm run build
```

輸出結果會在：

```text
dist/
```

### 8.5 本機預覽正式版

```bash
npm run preview
```

---

## 9. 目前安裝的套件

依 `package.json`，目前專案非常精簡：

### 開發依賴

- `vite`

### scripts

- `npm run dev`：開發模式
- `npm run build`：打包
- `npm run preview`：預覽打包結果

---

## 10. 需要哪些插件 / 工具

如果你問的是「這個專案執行或開發需要哪些東西」，可分成三類：

### 10.1 必要工具

- **Node.js**
- **npm**

這兩個是一定要有的，否則無法安裝依賴與執行 Vite。

### 10.2 專案必要 npm 套件

- **Vite**

目前沒有使用到其他框架插件，也沒有 Babel、TypeScript、ESLint、Prettier、Tailwind、React plugin 等額外套件。

### 10.3 建議的 VS Code 擴充套件

這些不是必需，但很建議：

- **ESLint**：若後續加入 lint 規則可直接使用
- **Prettier - Code formatter**：統一格式
- **EditorConfig for VS Code**：若後續補上 `.editorconfig` 會更穩定
- **Path Intellisense**：加快路徑輸入
- **GitLens**：方便追版本歷史

### 10.4 若未來要正式維護，建議補上的開發插件

目前專案能跑，但缺少一些工程化能力。建議後續補：

- `eslint`
- `prettier`
- `@eslint/js`
- `globals`

如果想提升可維護性，也可再考慮：

- `typescript`
- `vitest`
- `jsdom`

---

## 11. 部署說明

此專案已配置 GitHub Pages 自動部署。

### 部署條件

- repository 的預設分支應為 `main`
- GitHub Pages 需啟用 Actions 部署
- `vite.config.js` 中 `base` 必須與 repository 名稱一致

目前設定：

```js
base: "/fin_test/";
```

如果未來倉庫名稱改掉，例如改成 `quiz-app`，就必須同步修改為：

```js
base: "/quiz-app/";
```

否則靜態資源路徑會錯誤。

---

## 12. 架構優點

- 專案小而直接，容易快速上手
- 無框架依賴，部署簡單
- 題庫資料與畫面邏輯分離
- 有錯題模式與本機持久化，實用性高
- 已具備 GitHub Pages 自動部署能力

---

## 13. 目前架構上的限制

雖然目前可以正常運作，但有幾個明顯限制：

### 13.1 邏輯集中在單一檔案

`src/main.js` 同時負責：

- 狀態管理
- 商業邏輯
- DOM 組字串
- 事件處理

當功能繼續成長時，維護成本會快速提高。

### 13.2 沒有測試

目前沒有：

- 單元測試
- UI 測試
- 資料格式驗證測試

### 13.3 沒有 lint / formatter 設定

專案尚未看到：

- `.eslintrc` / `eslint.config.js`
- `.prettierrc`
- `.editorconfig`

### 13.4 沒有模組分層

可以考慮未來拆分成：

- `state/`
- `data/`
- `quiz/`
- `storage/`
- `render/`
- `utils/`

---

## 14. 建議的後續重構方向

若要讓這個專案更適合長期維護，建議依序做以下幾件事：

1. 將 `main.js` 拆成多個模組
2. 補上 `eslint` 與 `prettier`
3. 對 `data_table.json` 建立資料格式驗證
4. 加入測試框架，例如 `vitest`
5. 補上 README 與開發規範
6. 視需求加入搜尋、題庫管理、成績紀錄匯出等功能

---

## 15. 一句話總結

這是一個以 **Vite + 原生 JavaScript** 實作的題庫測驗前端專案，核心功能包含 **分類篩選、隨機抽題、單多選作答、錯題複習、分數統計與 GitHub Pages 自動部署**，目前架構簡單直接，適合小型專案快速交付，但若要持續擴充，建議盡快補上模組化、Lint、Formatter 與測試。
