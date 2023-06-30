const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("users.json");
const middlewares = jsonServer.defaults();
const rewriter = jsonServer.rewriter({
  "/projects/*": "/$1",
});

// Add the projects data as a custom route
const projectsData = require("./projectsData.json");

server.use(middlewares);
server.use(rewriter);
server.use(jsonServer.bodyParser);

// Extend the router with projects data
router.db.assign(projectsData).write();

server.use(router);

const port = 8001;

server.listen(port, () => {
  console.log(`JSON Server is running on http://192.168.88.188:${port}/users`);
});
