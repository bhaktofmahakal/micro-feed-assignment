import AuthBar from "@/components/auth-bar";

export const metadata = {
  title: "Micro Feed",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#fafafa' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
          <header style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>Micro Feed</h1>
            <AuthBar />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}