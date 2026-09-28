import "./globals.css";

export const metadata = {
  title: "Pricing Consequence Agent",
  description: "What happened the last time we tried this? Pricing decisions grounded in your own history.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}