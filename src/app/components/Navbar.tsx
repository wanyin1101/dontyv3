'use client';
import { useEffect, useState } from 'react';
import { client } from '@/app/client';
import Link from 'next/link';
import { ConnectButton, darkTheme, useActiveAccount } from 'thirdweb/react';
import { base, baseSepolia } from 'thirdweb/chains';

const Navbar = () => {
    const account = useActiveAccount();
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load the current theme from localStorage on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const isDark = storedTheme === 'dark';
        setIsDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    // Toggle Dark/Light Mode
    const toggleDarkMode = () => {
        setIsDarkMode((prev) => {
            const newMode = !prev;
            document.documentElement.classList.toggle('dark', newMode);
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    return (
        <nav className="bg-gray-100 text-gray-900 border-b-2 dark:bg-zinc-900 dark:text-neutral-200">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    {/* Left: Logo and Search Bar */}
                    <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href={'/main'}>
                                <img
                                    src="/donty.svg"
                                    alt="Website Logo"
                                    className="h-11 w-auto"
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Middle: Navigation Links */}
                    <div className="hidden sm:ml-6 sm:block">
                        <div className="flex space-x-4">
                            {/* Campaigns */}
                            <Link href={'/main/'} className="flex flex-col items-center space-y-1">
                                <img
                                    src="/campaigns.svg"
                                    alt="Campaigns Icon"
                                    className="h-6 w-6 icon-theme"
                                />
                                <p className="text-sm font-medium">Events</p>
                            </Link>

                            {/* Dashboard */}
                            {account && (
                                <Link
                                    href={`/dashboard/${account?.address}`}
                                    className="flex flex-col items-center space-y-1"
                                >
                                    <img
                                        src="/dashboard.svg"
                                        alt="Dashboard Icon"
                                        className="h-6 w-6 icon-theme"
                                    />
                                    <p className="text-sm font-medium">Dashboard</p>
                                </Link>
                            )}

                            {/* souvenir */}
                            <Link href={'/souvenir'} className="flex flex-col items-center space-y-1">
                                <img
                                    src="/souvenir.svg"
                                    alt="Souvenir Icon"
                                    className="h-6 w-6 icon-theme"
                                />
                                <p className="text-sm font-medium">Souvenir</p>
                            </Link>
                            {/* souvenir */}
                            <Link href={'/stake'} className="flex flex-col items-center space-y-1">
                                <img
                                    src="/stake.svg"
                                    alt="Stake Icon"
                                    className="h-6 w-6 icon-theme"
                                />
                                <p className="text-sm font-medium">Stake</p>
                            </Link>
                            {/* Transactions */}
                            <Link href={'/transactions'} className="flex flex-col items-center space-y-1">
                                <img
                                    src="/transaction.svg"
                                    alt="Transaction Icon"
                                    className="h-6 w-6 icon-theme"
                                />
                                <p className="text-sm font-medium">Transaction</p>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Connect Wallet & Dark Mode Button */}
                    <div className="absolute inset-y-0 right-0 flex items-center space-x-4 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {/* Dark Mode Toggle Button */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Toggle Dark Mode"
                        >
                            <img
                                src={isDarkMode ? '/sun.svg' : '/moon.svg'}
                                alt="Theme Toggle"
                                className="h-6 w-6 theme-icon"
                            />
                        </button>

                        {/* Connect Wallet Button */}
                        <ConnectButton
                            client={client}
                            chain={baseSepolia}
                            theme={darkTheme()}
                            detailsButton={{
                                style: { maxHeight: '50px' },
                            }}
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
