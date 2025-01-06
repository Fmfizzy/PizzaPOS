'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/orders', label: 'Shop Orders' },
    { href: '/manageitems', label: 'Manage Items' },
    { href: '/orderhistory', label: 'Order History' },
  ];

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl">
            Pizza Shop POS
          </Link>
          
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-[#00ADB5] text-white'
                    : 'text-[#3A4750] hover:bg-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}