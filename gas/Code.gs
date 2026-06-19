/**
 * マル税理士事務所 問い合わせフォーム ビルダー
 *   既存の空フォームに7問を流し込み、回答をスプレッドシートに保存し、
 *   新規回答をメール通知するトリガーを設定する。
 *
 *   使い方：Apps Scriptエディタに貼り付け → 関数 buildForm を一度だけ実行 → 認可 →
 *           実行ログに出る「回答URL / 短縮回答URL」を LP のボタンに差し込む。
 */

// ===== 対象ID・通知先（環境に合わせて設定） =====
var FORM_ID   = '1EAutreKtkEuRf4ZWsXow_1f8En2Fii1tGxrU4NVw1Qg'; // 流し込む空フォーム
var SS_ID     = '1pwqNEQonO_MRxnFSUZcO1Ssr_mg-zj7ogdwZhIUTSvY'; // 回答保存先スプレッドシート
var NOTIFY_TO = 'ken.furuta@37design.co.jp';                    // 新規回答の通知先（カンマ区切りで複数可）
// ==============================================

function buildForm(){
  var form = FormApp.openById(FORM_ID);
  form.setTitle('マル税理士事務所｜無料相談・お見積りフォーム');
  form.setDescription('いまの顧問料・決算料が分かれば、当事務所でいくらになるか概算をお答えします。お気軽にご記入ください。');
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);

  // 既存の質問をクリア（再実行で重複しないように）
  form.getItems().forEach(function(it){ form.deleteItem(it); });

  form.addTextItem().setTitle('お名前').setRequired(true);
  form.addTextItem().setTitle('会社名・屋号').setRequired(true);
  form.addTextItem().setTitle('メールアドレス（返信先になります）').setRequired(true);
  form.addTextItem().setTitle('電話番号').setHelpText('お電話での連絡をご希望の場合のみ').setRequired(false);
  form.addMultipleChoiceItem()
      .setTitle('いまの税理士について')
      .setChoiceValues(['今お願いしている税理士がいる', 'いない（これから探す）', '自分で申告している'])
      .setRequired(false);
  form.addTextItem()
      .setTitle('いまの費用（分かる範囲で）')
      .setHelpText('例：月額3万円＋決算料15万円 など。だいたいで構いません。')
      .setRequired(false);
  form.addParagraphTextItem().setTitle('ご相談内容・ご質問').setRequired(false);

  // 回答をスプレッドシートに保存
  form.setDestination(FormApp.DestinationType.SPREADSHEET, SS_ID);

  // 新規回答のメール通知トリガー（重複作成を防ぐ）
  ScriptApp.getProjectTriggers().forEach(function(t){
    if(t.getHandlerFunction() === 'onFormSubmitNotify'){ ScriptApp.deleteTrigger(t); }
  });
  ScriptApp.newTrigger('onFormSubmitNotify').forForm(form).onFormSubmit().create();

  Logger.log('編集URL  : ' + form.getEditUrl());
  Logger.log('回答URL  : ' + form.getPublishedUrl());
  try{ Logger.log('短縮回答URL: ' + form.shortenFormUrl(form.getPublishedUrl())); }catch(e){ Logger.log('短縮URL取得スキップ: ' + e); }
}

// 新規回答が入るたびに通知メールを送る
function onFormSubmitNotify(e){
  try{
    var lines = ['新しい問い合わせが届きました。', ''];
    e.response.getItemResponses().forEach(function(ir){
      lines.push(ir.getItem().getTitle() + '：' + ir.getResponse());
    });
    lines.push('');
    lines.push('回答一覧：https://docs.google.com/spreadsheets/d/' + SS_ID + '/edit');
    MailApp.sendEmail(NOTIFY_TO, '【マル税理士事務所】新しい問い合わせが届きました', lines.join('\n'));
  }catch(err){ console.error(err); }
}
