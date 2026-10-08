import type { NextConfig } from "next";

// GitHub Pages（静的ホスティング）で公開するため、静的書き出しにする。
// プロジェクトサイト（https://<user>.github.io/geireki-map/）用のパスは
// ビルド時の環境変数 PAGES_BASE_PATH で渡す（ローカルでは未設定 = ルート配信）。
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
