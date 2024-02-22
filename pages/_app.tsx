import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { UserProvider } from '../contex/UserContex';

const inter = Inter({ subsets: ["latin"] });

function App({ Component, pageProps }: AppProps<{}>) {
  return (
    <main className={inter.className} >
      <UserProvider>
      <Navbar />
      <Component {...pageProps} />
      </UserProvider>
    </main>
  );
}

export default App;
