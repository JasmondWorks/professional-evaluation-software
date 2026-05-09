'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Appraisal', href: '/book-of-record' },
    { name: 'Performance', href: '/book-of-record/performance' },
  ];

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-[#b0b0af] px-4 flex flex-col items-left justify-start">
      <nav className="flex justify-center w-full bg-white shadow-md">
        <ul className="flex items-center space-x-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center p-4 font-semibold transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-yellow-600 border-b-2 border-yellow-600'
                    : 'text-gray-800 hover:text-yellow-600'
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
