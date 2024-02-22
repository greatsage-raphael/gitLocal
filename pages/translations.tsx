import { useEffect, useState } from "react";
import { TextBlock } from "../components/TextBlock"; 
import { CodeBlock } from "../components/CodeBlock"; 
import Link from "next/link";
import { useUser } from '../contex/UserContex';

interface Translation {
  resultlist: {
    inputcode: string;
    outputcode: string;
    originalreporturl: string;
  }[];
}

export default function Translations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const { user } = useUser();
  console.log("USER ID :", user?.id);

  useEffect(() => {
    const handleRead = async () => {
      const requestBody = {
        git_id: user?.id,
      };
      try {
        const response = await fetch('/api/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    handleRead();
  }, []);

  return (
    <div className="flex h-full min-h-screen flex-col items-center bg-[#0E1117] px-4 pb-20 text-neutral-200 sm:px-10">
      <div className="mt-10 flex flex-col items-center justify-center sm:mt-20">
        <div className="text-4xl font-bold">
          Translations
        </div>
        {/* Iterate over the translations and display each code snippet */}
        {translations.map((translation, index) => (
          <div key={index} className="mt-8">
            {/* Assuming the resultlist contains an array of objects with inputcode and outputcode */}
            {translation.resultlist.map((item, idx) => (
              <div key={idx} className="mb-4 flex">
                <div className="flex-grow mr-4">
                <Link href={item.originalreporturl} className="text-2xl no-underline hover:text-slate-300 mx-2">
                {item.originalreporturl}
               </Link>
                  <CodeBlock code={item.inputcode} />
                  </div>
                <div className="flex-grow"><CodeBlock code={item.outputcode} /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
