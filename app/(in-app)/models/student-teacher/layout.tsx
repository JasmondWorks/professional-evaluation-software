import NavBar from "./_components/Navbar";

// Renders the Ordinary/Robust switcher across the whole student-teacher section.
// Without this the NavBar was never mounted, leaving /ordinary unreachable.
export default function StudentTeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <NavBar />
      {children}
    </div>
  );
}
