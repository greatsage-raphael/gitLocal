import axios from 'axios';


const GitLabAuth = {
  clientId: 'a851c9d8df9d92bd50fcc556137b7026e190bed99b3093512bc3f68c8a229095',
  clientSecret:'gloas-5f5ebad3dc9decc8ec77f141c257989b316eff374e88e238431c248ca9ec74d5',
  redirectUri: 'https://gitlocalizer.vercel.app/',
  gitLabBaseUrl: 'https://gitlab.com',

  async getAuthUrl(state: string, scope: string) {
    const authUrl = `${this.gitLabBaseUrl}/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&state=${state}&scope=${scope}`;
    return authUrl;
  },

  async getAccessToken(code: string, state: string) {
    const tokenEndpoint = `${this.gitLabBaseUrl}/oauth/token`;
    const params = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    };

    const response = await axios.post(tokenEndpoint, new URLSearchParams(params).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  },

  async refreshAccessToken(refreshToken: string) {
    const tokenEndpoint = `${this.gitLabBaseUrl}/oauth/token`;
    const params = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      redirect_uri: this.redirectUri,
    };

    const response = await axios.post(tokenEndpoint, new URLSearchParams(params).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  },
};

export default GitLabAuth;
