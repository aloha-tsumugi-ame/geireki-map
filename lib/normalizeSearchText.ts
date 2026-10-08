// 検索用の正規化。表示には使わない。
// - Unicode NFKC（全角英数・半角カナなどを統一）
// - 英字は小文字化
// - 空白（全角含む）と中黒を除去（「ケンドー コバヤシ」=「ケンドーコバヤシ」）
// - 波ダッシュ・チルダを統一（「～」=「〜」）
// - カタカナをひらがなに統一
// - 人名でよく使われる異体字を統一（﨑→崎、髙→高）
export function normalizeSearchText(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s・]+/g, "")
    .replace(/[~〜～]/g, "〜")
    .replace(/[ァ-ヶ]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    )
    .replace(/﨑/g, "崎")
    .replace(/髙/g, "高")
}
