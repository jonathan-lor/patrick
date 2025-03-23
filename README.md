# tidalhack-25
PATRICK.

# To anyone wanting to clone this

Our client is based on an open source MCP client implementation (Dive). The way the directory is structured will not work if you try to clone and run as is. This is because we just dropped the our MCP servers implementations into that mcp_servers folder to meet the devpost submission deadline.

The MCP servers can all be launched from the respective index.js files in their directories. You'll need to modify the config file from the client UI to specify the exact path for your machine.

We also want to emphasize that MCP servers can work with any compatible MCP client (there's alot! https://github.com/punkpeye/awesome-mcp-clients). This means that you can use our server implementations with any compatible MCP client (Claude Desktop App seems to be the best established app for this)

Also auth for the gmail MCP is a little funny. Half of that code isnt actually used in our working version and are remnants from hackathon development. You have to run the get-token at the root of gmcp directory to generate refresh token and save it in .env along with your client id and secret from google cloud gmail api. Also index.js for gmail MCP only needs to be launched from root of that gmcp folder. Right now the config file runs a shell script and cd's to the directory before starting the server. It's pretty jank

Just email me (jonathan) or something if you want setup help lolol

jonathan.r.lor@tamu.edu or jonathan.r.lor@gmail.com
justinbusker@tamu.edu
minhdao@tamu.edu
dorian_sat@tamu.edu


# Will clean all this up soon......

