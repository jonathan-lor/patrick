# tidalhack-25
repository for tidalhack 25

# To anyone wanting to clone this

Our client is based on an open source MCP client implementation (Dive). The way the directory is structured will not work if you try to clone and run as is. This is because we just dropped the our MCP server implementations into that mcp_server folder to meet the devpost submission deadline.

The MCP servers can all be launched from the respective index.js files in their directories. You'll need to modify the config to specify the exact path for your machine

Also auth for the gmail MCP is a little funny. Half of that code isnt actually used and you have to run the get-token at the root of gmcp directory to generate refresh token and save it in .env along with your client id and secret from google cloud gmail api

Will clean this up soon......

