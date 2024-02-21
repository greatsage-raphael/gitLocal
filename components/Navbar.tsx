import Link from "next/link";
import { useState, useEffect, SVGProps } from "react";
import GitLabAuth from '../utils/auth';
import { useRouter } from 'next/router';
import axios from "axios";
import Image from "next/image";

export default function Navbar() {
  
  
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleLogin = () => {
    
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  useEffect(() => {
    const generateAuthUrl = async () => {
      const state = 'YOUR_STATE'; // You need to generate a unique state value
      const scope = 'read_user'; // Specify the scopes you need
      const url = await GitLabAuth.getAuthUrl(state, scope);
      //const token = await GitLabAuth.getAccessToken
      console.log("URL", url)
      setAuthUrl(url);
    };

    generateAuthUrl();
  }, []);

  const router = useRouter();


  useEffect(() => {
    // Extract the authorization code and state from the query parameters
    const { code, state } = router.query;

    // Check if both code and state are present
    if (code && state) {
      // Use the GitLabAuth utility to exchange the authorization code for an access token
      GitLabAuth.getAccessToken(code as string, state as string)
        .then((accessTokenData) => {
          // Save the access token as a cookie
        document.cookie = `accessToken=${accessTokenData.access_token}; path=/`;

          // Use the obtained access token to fetch user information
          return getUserInfo(accessTokenData.access_token);
        })
        .then((user) => {
          // Handle the user information as needed
          console.log('User Information:', user);
          setUserInfo(user);
          console.log("Avatar", user.id)

          const requestBody = {
            // Provide the necessary data here
            git_id: user.id,
            name: user.name,
            username: user.username,
            avatar_url: user.avatar_url,
            web_url: user.web_url,
            email: user.email,
          }
          

          const InsertData = async () => { 
            try {
              const response = await fetch('/api/insert', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
              });
        
              if (!response.ok) {
                throw new Error('Failed to insert data');
              }
        
              const data = await response.json();
              console.log('Response data:', data);
            } catch (error) {
              console.error('Error inserting dummy data:', error);
            }
          };
        
          InsertData()
        })
        .catch((error) => {
          // Handle errors appropriately
          console.error('Error exchanging code for access token or fetching user info:', error);
        });
    } else {
      // Handle the case where either code or state is missing
      console.error('Missing code or state in the query parameters');
    }
    
  }, [router.query]);

  async function getUserInfo(accessToken: string) {
    const userEndpoint = 'https://gitlab.com/api/v4/user';
  
    // Append the access token as a query parameter to the user endpoint URL
    const urlWithAccessToken = `${userEndpoint}?access_token=${accessToken}`;
  
    // Send a GET request to the modified GitLab user endpoint
    const response = await axios.get(urlWithAccessToken);
  
    // Return the user information from the response
    console.log("response", response.data)
    return response.data;
  }

//   // Retrieve the access token from cookies
// if (typeof document !== 'undefined') {
//   const cookies = document.cookie.split(';');
//   const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
//   const storedAccessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;

//   if (storedAccessToken) {
//     // Use the stored access token as needed
//     console.log('Stored Access Token:', storedAccessToken);
//   } else {
//     // Access token is not available
//     console.log('Access Token not found');
//   }
// }


  return (
    <nav className="flex flex-wrap items-center justify-between w-full h-5 gap-4 px-4 pt-4 pb-20 font-sans text-white md:px-20 md:gap-10 bg-[#0E1117]">
      <div className="flex items-center mr-6">
        <Link href="/" className="text-2xl no-underline hover:text-slate-300 mx-2">
          GitTranslate
        </Link>
        <GitIcon className="h-2 w-2" />
      </div>

      <div className="flex items-center mr-6">
        <Link href="/translations" className="text-2xl no-underline hover:text-slate-300 mx-2">
          Translations
        </Link>
      </div>
      

<div className="ml-auto">
          {userInfo ? (
            // Render avatar if userInfo is available
            <Image
              src={userInfo.avatar_url}
              alt={userInfo.name}
              width={80} // Add the width property with the appropriate value
              height={80}
              className="rounded-full w-8 h-8 cursor-pointer"
            />
          ) : (
            // Render Sign In button if userInfo is not available
            <>
              <button
              onClick={handleLogin}
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md cursor-pointer hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In 
                
              </button>
            </>
          )}
        </div>
    </nav>
  );
}


function GitIcon(p: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fillRule="evenodd">
      <path d="M16 30.739L21.892 12.6H10.108z" fill="#e24329"/>
      <path d="M16 30.739L10.108 12.6H1.85z" fill="#fc6d26"/>
      <path d="M1.85 12.6L0.06 18.115a1.22 1.22 0 0 0 .444 1.364L16 30.739z" fill="#fca326"/>
      <path d="M1.85 12.6h8.257L5.875 1.682c-.23-.71-1.23-.71-1.46 0z" fill="#e24329"/>
      <path d="M16 30.739L21.892 12.6H31.15z" fill="#fc6d26"/>
      <path d="M31.15 12.6l1.79 5.516a1.22 1.22 0 0 1-.444 1.364L16 30.739z" fill="#fca326"/>
      <path d="M31.15 12.6H21.892l3.549-10.922c.23-.71 1.23-.71 1.46 0z" fill="#e24329"/>
    </svg>
  );
}
