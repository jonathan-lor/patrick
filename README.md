# tidalhack-25
repository for tidalhack 25

# To anyone wanting to clone this

Our client is based on an open source MCP client implementation (Dive). The way the directory is structured will not work if you try to clone and run as is. This is because we just dropped the our MCP servers implementations into that mcp_server folder to meet the devpost submission deadline.

The MCP servers can all be launched from the respective index.js files in their directories. You'll need to modify the config file from the client UI to specify the exact path for your machine.

You can also use these servers with any compatible MCP client (Claude Desktop App seems to be the best established app for this)

Also auth for the gmail MCP is a little funny. Half of that code isnt actually used in our working version and are remnants from hackathon development. You have to run the get-token at the root of gmcp directory to generate refresh token and save it in .env along with your client id and secret from google cloud gmail api. Also index.js for gmail MCP only needs to be launched from root of that gmcp folder.

Just email me (jonathan) or something if you want setup help lolol

jonathan.r.lor@tamu.edu or jonathan.r.lor@gmail.com
justinbusker@tamu.edu
minhdao@tamu.edu
dorian_sat@tamu.edu


Will clean this up soon......

