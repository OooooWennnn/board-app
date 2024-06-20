import express from "express";
import { boardService } from "./board-service.js";
import { utils } from "./utils.js";

const app = express();
const port = 3000;
const session = {};

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(checkSession);
app.use(checkLoggedIn);

function generateUniqueSessionId() {
  return Math.floor(Math.random() * 10000);
}

function parseCookies(cookieStr) {
  const cookies = {};
  if (cookieStr) {
    const cookiePairs = cookieStr.split(";");
    cookiePairs.forEach((cookie) => {
      const [key, value] = cookie.split("=").map((str) => str.trim());
      cookies[key] = value;
    });
  }
  return cookies;
}

function checkSession(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (sessionId && session[sessionId]) {
    req.user = session[sessionId].user;
    res.locals.userName = req.user.userName;
  }
  next();
}

function checkLoggedIn(req, res, next) {
  res.locals.isLoggedIn = req.user ? true : false;
  next();
}

boardService
  .initialize()
  .then(() => {
    app.listen(port, () => {
      console.log("Server is running on port " + port);
    });
  })
  .catch((error) => {
    console.error("Error initializing board service:", error);
  });

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/board", (req, res) => {
  var author = req.query.author;
  var date = req.query.date;
  var line = req.query.line;
  var page = parseInt(req.query.page) || 1;
  var perPage = parseInt(req.query.perPage) || 10;

  if (author) {
    boardService
      .getPostByAuthor(author)
      .then((posts) => {
        posts = utils.formatPosts(posts);
        res.render("board.ejs", { posts: posts, page: page });
      })
      .catch((error) => {
        console.error("Error loading the posts: ", error);
        res.render("board.ejs", { posts: null, message: "No post to display" });
      });
  } else if (date) {
    boardService
      .getPostByDate(date)
      .then((posts) => {
        posts = utils.formatPosts(posts);
        res.render("board.ejs", { posts: posts });
      })
      .catch((error) => {
        console.error("Error loading the posts: ", error);
        res.render("board.ejs", { posts: null, message: "No post to display" });
      });
  } else if (line) {
    boardService
      .searchPost(line)
      .then((posts) => {
        posts = utils.formatPosts(posts);
        res.render("board.ejs", { posts: posts });
      })
      .catch((error) => {
        console.error("Error loading the posts: ", error);
        res.render("board.ejs", { post: null, message: "No post to display" });
      });
  } else {
    boardService
      .getAllPosts(page, perPage)
      .then((posts) => {
        posts = utils.formatPosts(posts);
        res.render("board.ejs", { posts: posts, page: page });
      })
      .catch((error) => {
        console.error("Error loading the posts:", error);
        res.render("board.ejs", { message: "No post to display" });
      });
  }
});

app.get("/board/:id", async (req, res) => {
  const id = req.params.id;
  const edit = req.query.edit;

  try {
    let post = await boardService.getPostById(id);
    post = await utils.formatPosts(post);

    if (edit) {
      res.render("add.ejs", { post: post });
      console.log(post);
      return;
    }

    res.render("post.ejs", { post: post });
  } catch (error) {
    console.error("Error loading the post: ", error);
    res.render("post.ejs", { post: null, message: "No post to display" });
  }

  // if(id){
  //   if(edit) {
  //     res.send("edit page");
  //     console.log(req.body);
  //   }
  //   else{
  //     boardService
  //       .getPostById(id)
  //       .then((post) => {
  //         post = utils.formatPosts(post)
  //         res.render("post.ejs", { post: post });
  //       })
  //       .catch((error) => {
  //         console.error("Error loading the post: ", error);
  //         res.render("post.ejs", { post: null, message: "No post to display" });
  //       });
  //   }
  // }
});

app.get("/add", (req, res) => {
  const user = req.user;
  if (!user) {
    res.redirect("/signIn");
  } else {
    res.render("add.ejs", { author: user.userName });
  }
});

app.post("/add", checkSession, (req, res) => {
  boardService.addPost(req.body).then(() => {
    res.redirect("/board");
  });
});

app.get("/signUp", (req, res) => {
  res.render("signup.ejs");
});

app.get("/signIn", (req, res) => {
  res.render("signin.ejs");
});

app.post("/signUp", async (req, res) => {
  try {
    await boardService.signUp(req.body);
    res.redirect("/signIn");
  } catch (error) {
    console.log(error);
  }
});

app.post("/signIn", async (req, res) => {
  try {
    const user = await boardService.checkUser(req.body);
    if (user) {
      const sessionId = generateUniqueSessionId();
      session[sessionId] = { user };

      res.cookie("sessionId", sessionId);
      res.redirect("/");
    } else {
      res.send(
        '<script>alert("Cannot find the account!"); window.location.href = "/signIn";</script>'
      );
      // res.redirect('/signIn');
    }
  } catch (error) {
    console.log(error);
  }
});

// app.get("/search", (req, res) => {
//   console.log(req.query.line);
//     boardService.searchPost(req.query.line).then((posts) => {
//       res.render("search.ejs", { posts: posts });
//     }).catch((error) => {
//       console.error("Error loading the posts: ", error);
//       res.render("search.ejs", { post: null, message: "No post to display" });
//     })
// })

// app.get("/post", (req, res) => {
//     boardService.getPostById(req.query.id).then((post) => {
//       res.render("post.ejs", { post: post });
//     }).catch((error) => {
//       console.error("Error loading the post: ", error);
//       res.render("post.ejs", { post: null, message: "No post to display" });
//     })
// })

// app.get("/post/:author", (req, res) => {
//   console.log(req.query.author);
//     boardService.getPostByAuthor(req.params.author).then((post) => {
//       res.render("post.ejs", { post: post });
//     }).catch((error) => {
//       console.error("Error loading the posts: ", error);
//       res.render("post.ejs", { post: null, message: "No post to display" });
//     })
// })
