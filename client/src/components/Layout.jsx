import TopNav from "./TopNav";
export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="max-w-6xl mx-auto p-5">{children}</main>
    </div>
  );
}
