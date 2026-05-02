// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "SimplificIA — Dashboard",
	description: "Sistema de gestión para tu negocio",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<body
				className={`${inter.className} bg-[#111111] text-white min-h-screen`}
			>
				{children}
			</body>
		</html>
	);
}
