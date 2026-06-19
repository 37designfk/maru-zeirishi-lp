# 問い合わせフォーム（Googleフォーム）セットアップ

LPの「無料で相談・お見積りを依頼する」ボタンは Googleフォームへのリンクです。回答は自動でスプレッドシートに貯まり、新規回答はメールで通知されます。外部サービス不要・無料。Googleアカウント1つで完結します。

## 採用方式（GAS Web App ではない）

当初は GAS Web App（`doPost`）でLP内に埋め込みフォームを置く構成を検討しましたが、37design の Google Workspace の組織ポリシーで「アクセスできるユーザー＝全員（匿名含む）」のウェブアプリを公開できないため断念。**Googleフォーム本体は「リンクを知っている全員」で公開できる**ので、フォームへのボタンリンク方式に切り替えました。

`Code.gs` の `buildForm()` は、空のGoogleフォームに7問を流し込み、回答先スプレッドシートを紐づけ、新規回答のメール通知トリガーを設定するビルダーです（手作業の質問追加を避けるため）。

## 実体（2026-06-19 構築済み）

- フォーム編集URL: `https://docs.google.com/forms/d/1EAutreKtkEuRf4ZWsXow_1f8En2Fii1tGxrU4NVw1Qg/edit`
- 回答URL（LPボタンのリンク先 / 短縮）: `https://forms.gle/HNLzNHERpsepxAMX8`
- 回答保存スプレッドシート: `https://docs.google.com/spreadsheets/d/1pwqNEQonO_MRxnFSUZcO1Ssr_mg-zj7ogdwZhIUTSvY/edit`
- 所有アカウント: `ken.furuta@37design.co.jp`（37design Workspace）
- 通知先: `ken.furuta@37design.co.jp`
- 公開状態: 「回答を受付中」ON / 回答者「リンクを知っている全員」

## 質問構成（7問）

1. お名前（必須）
2. 会社名・屋号（必須）
3. メールアドレス（返信先になります）（必須）
4. 電話番号（任意 / お電話希望の場合のみ）
5. いまの税理士について（任意 / 3択）
6. いまの費用（分かる範囲で）（任意）
7. ご相談内容・ご質問（任意）

## 作り直し・項目変更の手順

`Code.gs` を編集して `buildForm()` を再実行すれば、既存の質問を全削除してから入れ直します（同じフォームID・スプシIDに対して何度でも安全に再実行可）。

1. Apps Scriptエディタで `Code.gs` を開く（このプロジェクトは上記フォームに紐づくスタンドアロンスクリプト）。
2. 関数セレクタで `buildForm` を選び「実行」。
3. 初回のみ権限承認（FormApp / スプレッドシート / MailApp）。「このアプリは確認されていません」が出たら「詳細」→「（プロジェクト名）に移動」→「許可」。
4. 実行ログに 編集URL / 回答URL / 短縮回答URL が出る。
5. 回答URL（短縮）が変わった場合は `index.html` のCTAリンク `href` を差し替える（**ヘッダー・見直し下・最下部CTAの3箇所すべて**。同じ `forms.gle/...` URLが3箇所に直書きされているので差し替え漏れに注意）。
6. 再実行前の確認: フォーム編集画面の「回答」タブで回答先スプレッドシートが**1件のみ**であることを確認する（`setDestination` の多重連結事故を防ぐ。`buildForm` は既存と同一シートなら再設定をスキップするが、念のため目視確認）。

## LP側

`index.html` のCTAは Googleフォームへのリンクを**3箇所**に設置済み（すべて `target="_blank" rel="noopener"`）。

| 位置 | クラス | 文言 |
|---|---|---|
| ヘッダー | `hcta` | 無料で相談する |
| 見直し下 | `btn btn-primary` | まずは無料で相談する |
| 最下部CTA（`#contact`） | `btn btn-white` | 無料で相談する |

```html
<a href="https://forms.gle/HNLzNHERpsepxAMX8" target="_blank" rel="noopener" class="btn btn-white">無料で相談する</a>
```

## 動作確認

1. LPのボタンを押す → 別タブでフォームが開く。
2. テスト送信 → スプレッドシートに行が増える。
3. `ken.furuta@37design.co.jp` に通知メールが届く。

## 運用メモ

- 通知トリガーは `onFormSubmitNotify`（インストール型 onFormSubmit トリガー）。`buildForm` 再実行時に重複しないよう古いトリガーを削除してから付け直す。
- スプレッドシートを横山先生・泉さんと共有する場合は、シート側の共有設定で追加する。
- Drive上のフォーム文書名は「無題のフォーム」のまま（回答者に表示されるフォーム見出しは `マル税理士事務所｜無料相談・お見積りフォーム`）。気になる場合のみ手動でリネーム。
