import { useEffect, useState } from "react";

export default function Translations() {
  const [gitId, setGit_id] = useState<Number>()

  useEffect(() => {
  const handleRead = async () => {
    const requestBody = {
      // Provide the necessary data here
      git_id: 11830307,
    }
  
  try {
    const response = await fetch('/api/read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  
    if (!response.ok) {
      throw new Error('Failed to update data');
    }
  
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  }
}
handleRead()
}, [gitId]);

  
  return (
    <>
      <div className="flex h-full min-h-screen flex-col items-center bg-[#0E1117] px-4 pb-20 text-neutral-200 sm:px-10">
        <div className="mt-10 flex flex-col items-center justify-center sm:mt-20">
          <div className="text-4xl font-bold">
            Translations
          </div>
        </div>
        
      </div>
        
    </>
  );
}