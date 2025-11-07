'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { FiShoppingCart, FiUser } from 'react-icons/fi';

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link href="/" className="text-2xl font-bold text-black">
              HYPEX
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6">
                <li>
                  <Link
                    href="/produtos"
                    className={`text-sm font-medium transition hover:text-gray-500 ${
                      pathname === '/produtos' ? 'text-black' : 'text-gray-500'
                    }`}
                  >
                    Produtos
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      className={`text-sm font-medium transition hover:text-gray-500 ${
                        pathname.startsWith('/admin')
                          ? 'text-black'
                          : 'text-gray-500'
                      }`}
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/carrinho"
                className="rounded-full p-2 text-gray-600 hover:text-gray-500"
              >
                <span className="sr-only">Carrinho</span>
                <FiShoppingCart className="h-6 w-6" />
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full bg-gray-100 p-2 text-gray-600 hover:text-gray-500"
                    onClick={() => signOut()}
                  >
                    <span className="sr-only">Menu do usuário</span>
                    <FiUser className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}