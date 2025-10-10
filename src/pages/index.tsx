import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>Gather Is Bad</title>
                <meta name="description" content="" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className="w-screen h-screen relative">
                <AppWithoutSSR />
            </main>
        </>
    );
}
