import { SVGProps, useEffect, useState } from "react";
import { CodeBlock } from "../components/CodeBlock"; 
import Link from "next/link";
import { useUser } from '../contex/UserContex';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/Accordion";

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
        <div className="text-6xl font-bold">
          Translations
        </div>
        {/* Check if user is available */}
        {user ? (
          // User is available, render translations
          <>
            {/* Iterate over the translations and display each code snippet */}
            {translations.map((translation, index) => (
              <div key={index} className="mt-8">
                {/* Assuming the resultlist contains an array of objects with inputcode and outputcode */}
                {translation.resultlist.map((item, idx) => (
                  <Accordion className="w-full" collapsible type="single" key={idx}>
                    <AccordionItem value={item.originalreporturl}>
                      <AccordionTrigger className="text-base">
                        <Link href={item.originalreporturl} className="text-2xl no-underline hover:text-slate-300 mx-2">
                          {item.originalreporturl}
                        </Link>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex-grow mr-4">
                          <CodeBlock code={item.inputcode} />
                        </div>
                        <div className="flex-grow">
                          <CodeBlock code={item.outputcode} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            ))}
          </>
        ) : (
          // User is not available, display sign in message
          <p className="text-3xl font-bold">Please sign in to see your translations </p>
        )}
      </div>
    </div>
  );
}
