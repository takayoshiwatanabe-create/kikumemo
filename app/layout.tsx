import { ReactNode } from 'react';

export const metadata = {
  title: 'キクメモ (KikuMemo)',
  description: 'AI議事録生成サービス',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
