import React from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Outlet, Link, Navigate } from "react-router-dom";

export function LayOut() {
    return <div className="app-layout">
        <header className="app-header">
            <div className="header-content">
                <h1>Challenge Generator</h1>
                <nav>
                    <SignedIn>
                        <Link to="/">Generate</Link>
                        <Link to="/history">History</Link>
                        <UserButton/>
                    </SignedIn>
                </nav>
            </div>
        </header>

        <main className="app-main">
            <SignedOut>
                <Navigate to="/signin" replace/>
            </SignedOut>

            <SignedIn>
                <Outlet/>
            </SignedIn>
        </main>
    </div>
}