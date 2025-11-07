'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBox, FiTag, FiUsers, FiPackage, FiTruck } from 'react-icons/fi';

const navigation = [
  { name: 'Produtos', href: '/admin/produtos', icon: FiBox },
  { name: 'Cupons', href: '/admin/cupons', icon: FiTag },
  { name: 'Usuários', href: '/admin/usuarios', icon: FiUsers },
  { name: 'Pedidos', href: '/admin/pedidos', icon: FiPackage },
  { name: 'Entregas', href: '/admin/entregas', icon: FiTruck },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden w-64 border-r border-gray-200 bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <span className="text-xl font-semibold">Admin</span>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-gray-100 text-black'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        pathname === item.href
                          ? 'text-black'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}