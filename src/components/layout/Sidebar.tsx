"use client";
// components/layout/Sidebar.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboard,
	CalendarDays,
	Users,
	Building2,
	Settings,
	LogOut,
	Shield,
} from "lucide-react";
import clsx from "clsx";

interface UserInfo {
	id: number;
	email: string;
	rol: "admin" | "owner";
	negocio_nombre: string | null;
}

export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const [user, setUser] = useState<UserInfo | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/auth/me")
			.then((res) => res.json())
			.then((data) => {
				if (data.user) setUser(data.user);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [pathname]);

	async function handleLogout() {
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/login");
		router.refresh();
	}

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['owner'] },
    { label: 'Dashboard', href: '/panel', icon: LayoutDashboard, roles: ['admin'] },
    { label: 'Negocios', href: '/negocios', icon: Building2, roles: ['admin'] },
    { label: 'Clientes', href: '/clientes', icon: Users, roles: ['owner', 'admin'] },
    { label: 'Reservas', href: '/reservas', icon: CalendarDays, roles: ['owner', 'admin'] },
    { label: 'Configuración', href: '/configuracion', icon: Settings, roles: ['admin'] },
  ];

	const visibleItems = navItems.filter(
		(item) => user && item.roles.includes(user.rol),
	);

	const initials = user?.negocio_nombre
		? user.negocio_nombre
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "??";

	return (
		<aside className="fixed left-0 top-0 h-full w-60 bg-[#141414] border-r border-white/5 flex flex-col z-50">
			<div className="px-6 py-6 border-b border-white/5">
				<Link href="/" className="flex items-center gap-3">
					<Image
						src="/logo.png"
						alt="SimplificIA"
						width={185}
						height={120}
						className="rounded-lg"
					/>
				</Link>
			</div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse mx-4" />
          ))
        ) : (
          visibleItems.map(({ label, href, icon: Icon }) => {
					const isActive = pathname === href;
					return (
						<Link
							key={href}
							href={href}
							className={clsx(
								"flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
								isActive
									? "bg-green-500 text-black"
									: "text-gray-400 hover:text-white hover:bg-white/5",
							)}
						>
							<Icon size={18} />
							{label}
						</Link>
					);
				})
        )}
      </nav>

			<div className="px-4 py-4 border-t border-white/5">
				{loading ? (
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
						<div className="flex-1 space-y-1.5">
							<div className="h-3 bg-white/10 rounded animate-pulse" />
							<div className="h-2.5 bg-white/10 rounded animate-pulse w-16" />
						</div>
					</div>
				) : user ? (
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
							{initials}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-white truncate">
								{user.negocio_nombre ?? user.email}
							</p>
							<p className="text-xs text-gray-500 capitalize">{user.rol}</p>
						</div>
						<button
							onClick={handleLogout}
							className="text-gray-500 hover:text-red-400 transition-colors"
							title="Cerrar sesión"
						>
							<LogOut size={16} />
						</button>
					</div>
				) : (
					<Link
						href="/login"
						className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm"
					>
						<Shield size={16} />
						Iniciar Sesión
					</Link>
				)}
			</div>
		</aside>
	);
}
