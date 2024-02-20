import { CodeBlock } from '@/components/CodeBlock';
import { LanguageSelect } from '@/components/LanguageSelect';
import { TextBlock } from '@/components/TextBlock';
import { TranslateBody } from '@/types/types';
import Head from 'next/head';
import { SVGProps, useEffect, useState } from 'react';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface GitLabDataProps {
  projectId: string;
}

interface GitLabItem {
  id: string;
  name: string;
  type: string;
  path: string;
  children?: GitLabItem[];
}

export default function Home() {
  const [inputLanguage, setInputLanguage] = useState<string>('JavaScript');
  const [outputLanguage, setOutputLanguage] = useState<string>('Python');
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string>('');
  const [data, setData] = useState<GitLabItem[]>([]);
  const [tree, setTreeView] = useState<GitLabItem[]>([]);
  const [tag, setTag] = useState<string | null>(null);
  const [textOutput, setTextOutput] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [encodedID, setEncodedID] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [path, setPath] = useState<string>('Fetched Repo');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  

  const handleTranslate = async () => {
    const maxCodeLength = 12000;
    if (inputLanguage === outputLanguage) {
      alert('Please select different languages.');
      return;
    }

    if (!inputCode) {
      alert('Please enter some code.');
      return;
    }

    if (inputCode.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputCode.length} characters.`,
      );
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body: TranslateBody = {
      inputLanguage,
      outputLanguage,
      inputCode,
    };

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    setHasTranslated(true);
    copyToClipboard(code);
  };

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectId(e.target.value);
  };

  useEffect(() => {
    if (hasTranslated) {
      handleTranslate();
    }
  }, [outputLanguage, handleTranslate, hasTranslated]);

  

  const fetchRawContent = async (blobId: string, name: string) => {
    setOutputCode('');
    try {
      const response = await fetch(
        `https://gitlab.com/api/v4/projects/${encodedID}/repository/blobs/${blobId}/raw`,
      );
      const rawContent = await response.text();
      setInputCode(rawContent);
      setTag(name);
    } catch (error) {
      console.error('Error fetching raw content:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {

      function encodeGitlabUrl(url: string) {
        if (/^\d+$/.test(url)) {
            return url;
        } else {
        const domain = 'gitlab.com/';
        const pattern = /(?:https?:\/\/)?(?:www\.)?(.+)/;
        const match = url.match(pattern);
    
        if (match && match[1].includes(domain)) {
            const path = match[1].substring(match[1].indexOf(domain) + domain.length);
            setPath(path)
            return encodeURIComponent(path);
        } else {
            return "Invalid URL format";
        }
    }
    }

      const id = encodeGitlabUrl(projectId)
      setEncodedID(id)

      try {
        const response = await fetch(
          `https://gitlab.com/api/v4/projects/${id}/repository/tree?ref_name=main&recursive=true&pagination=none`,
        );

        const tree = await fetch(
          `https://gitlab.com/api/v4/projects/${id}/repository/tree`,
        );

        
        const jsonData = await response.json();
        const treeData = await tree.json();

        const filteredData = jsonData.filter(
          (item: { type: string }) => item.type !== 'tree',
        );

        setData(filteredData);
        setTreeView(treeData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [projectId]);

  async function generateExplanation() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setTextOutput(true)

    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: inputCode }),
    });

    let explanation = await res.json();
    // console.log('Explain shit', explanation);
    const combinedString = explanation.join('');
    console.log('Explain shit', combinedString);
    if (res.status !== 200) {
      console.log('fail:', explanation);
    } else {
      setOutputCode(combinedString)
    }
    setLoader(false);
  }


const renderTree = (nodes: GitLabItem[], parentPath: string = '') => {
  return nodes.map(node => (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={node.name}
      onClick={() => handleNodeClick(node)}
      // Check if the node is a folder (tree) and render its children if expanded
      // Otherwise, render nothing
      children={node.type === 'tree' && node.path.startsWith(parentPath)
        ? renderTree(node.children || [], node.path)
        : null}
      // Set the tree node's icon based on its type (folder or file)
      icon={node.type === 'tree' ? <FolderIcon /> : <FileCodeIcon />}
    />
  ));
};

// Modify handleNodeClick function
const handleNodeClick = async (node: GitLabItem) => {
    if (node.type === 'tree') {
      try {
        const response = await fetch(`https://gitlab.com/api/v4/projects/${encodedID}/repository/tree?path=${node.path}`);
        const treeData = await response.json();
        // Update tree view with the new data
        setTreeView(treeData);
        // Push the clicked folder's path onto the current path stack
        setCurrentPath([...currentPath, node.path]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      // Handle file click, you can add your logic here
      // For example, fetch raw content of the file
      fetchRawContent(node.id, node.name);
    }
  };

  // Add a function to handle navigation back
const handleNavigateBack = () => {
    // Pop the last path from the current path stack
    const newPathStack = [...currentPath];
    newPathStack.pop();
    setCurrentPath(newPathStack);
    // Fetch data for the parent directory
    const parentPath = newPathStack[newPathStack.length - 1] || ''; // Get the parent path or use an empty string if it's the root
    fetchData(parentPath);
  };

  // Modify fetch data function to accept a path parameter
const fetchData = async (path: string = '') => {
    try {
      const response = await fetch(`https://gitlab.com/api/v4/projects/${encodedID}/repository/tree?path=${path}`);
      const treeData = await response.json();
      // Update tree view with the new data
      setTreeView(treeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


const treeData = {
  id: 'root',
  name: path,
  children: tree,
};



const handleSave = async () => {
  setIsSaving(true)
  console.log("output", outputCode)
  const requestBody = {
    // Provide the necessary data here
    git_id: 11830307,
    inputcode: inputCode,
    outputcode: outputCode,
    originalreporturl: projectId
  }

try {
  const response = await fetch('/api/update', {
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
setIsSaving(false)
};

  return (
    <>
      <Head>
        <title>Code Translator</title>
        <meta
          name="description"
          content="Use AI to translate code from one language to another."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-full min-h-screen flex-col items-center bg-[#0E1117] px-4 pb-20 text-neutral-200 sm:px-10">
        <div className="mt-10 flex flex-col items-center justify-center sm:mt-20">
          <div className="text-4xl font-bold">
            AI Powered Localization Effort
          </div>
        </div>
        <div className="mt-6 text-center text-sm">
          <p>Gitlab Project URL or ID: </p>
          <input
            className="mt-1 h-[24px] w-[280px] rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            type="text"
            id="projectId"
            value={projectId}
            onChange={handleInputChange}
          />
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <button
            className="w-[140px] cursor-pointer rounded-md bg-violet-500 px-4 py-2 font-bold hover:bg-violet-600 active:bg-violet-700"
            onClick={() => handleTranslate()}
            disabled={loading}
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>

          <button
            className="w-[140px] cursor-pointer rounded-md bg-violet-500 px-4 py-2 font-bold hover:bg-violet-600 active:bg-violet-700"
            onClick={() => generateExplanation()}
            disabled={loading}
          >
            {loading ? 'Explaining...' : 'Explain'}
          </button>
        </div>{' '}
        <br />
        <div className="mt-2 text-center text-xs">
          {loading
            ? 'Translating...'
            : hasTranslated
            ? 'Output copied to clipboard!'
            : 'Enter an id, click on a file and "Translate" to any selected language'}
        </div>

        <div className="mt-6 flex w-full max-w-[1600px] flex-col justify-between sm:flex-row sm:space-x-4">
        {projectId && (
          
        <TreeView
  aria-label="file system navigator"
  defaultCollapseIcon={<ExpandMoreIcon />}
  defaultExpandIcon={<ChevronRightIcon />}
  className="bg-slate-900  rounded-lg shadow-md p-4"
>
<div className="text-center text-xl font-bold">{path}</div>
  {renderTree(treeData.children || [])} 
  <div className="flex items-center mt-4">
    <button 
      onClick={handleNavigateBack}
      className="flex items-center text-gray-600 hover:text-gray-500 transition-colors focus:outline-none"
    >
      <ChevronLeftIcon className="mr-2 h-4 w-4" />
      Navigate Back
    </button>
  </div>
</TreeView>
        )}



          <div className="h-100 flex flex-col justify-center space-y-2 sm:w-2/4">

            <div className="text-center text-xl font-bold">{tag}</div>

            <LanguageSelect
              language={inputLanguage}
              onChange={(value) => {
                setInputLanguage(value);
                setHasTranslated(false);
                setInputCode('');
                setOutputCode('');
              }}
            />

            <CodeBlock
              code={inputCode}
              editable={!loading}
              onChange={(value) => {
                setInputCode(value);
                setHasTranslated(false);
              }}
            />
          </div>
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="text-center text-xl font-bold"> {tag}</div>

            <LanguageSelect
              language={outputLanguage}
              onChange={(value) => {
                setOutputLanguage(value);
                setOutputCode('');
              }}
            />

            {textOutput === true ? (
              <TextBlock text={outputCode} />
            ) : (
              <CodeBlock code={outputCode} />
            )
            }

           <button
             className={`bg-blue-600 w-full hover:bg-blue-700 text-white font-bold mt-6 py-2 px-4 rounded
               ${
                isSaving
                   ? "cursor-not-allowed opacity-50"
                   : ""
               }`}
             type="submit"
             disabled={isSaving   }
             onClick={handleSave}
           >
             {isSaving ? "Saving Translation" : "Save Translation"}
           </button>
          </div>
        </div>
      </div>
    </>
  );

  function FileCodeIcon(
    props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
  ) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m10 13-2 2 2 2" />
        <path d="m14 17 2-2-2-2" />
      </svg>
    );
  }
}

function FolderIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  )
}

function ChevronLeftIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
