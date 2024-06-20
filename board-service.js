import mongoose from "mongoose";
import { utils } from "./utils.js";

const Schema = mongoose.Schema;
const db =
  "mongodb+srv://hanjuho0:Gks248650@cluster.wtdzyt8.mongodb.net/?retryWrites=true&w=majority";

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const postSchema = new Schema({
  category: {
    type: Number,
    required: [true, "Please choose category"],
  },
  postDate: {
    type: Date,
    default: new Date(),
    // default: () => {
    //     var now = new Date();
    //     return utils.formatDate(now);
    // }
  },
  lastUpdated: {
    type: Date,
    default: new Date(),
    // default: () => {
    //     var now = new Date();
    //     return utils.formatDate(now);
    // }
  },
  title: {
    type: String,
    required: [true, "Please add title"],
  },
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: [true, "Please add content"],
  },
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

function initialize() {
  return mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Successfully connected to MongoDB!");
    })
    .catch((err) => {
      console.log("Failed to connect", err);
    });

  // fs.readFile('./data/data.json', 'utf8', (err, data) => {
  //     if(err){
  //         console.error("Error reading file: ", err);
  //         reject(err);
  //         return;
  //     }

  //     try{
  //         board = JSON.parse(data);
  //         console.log("Board initialized", board);
  //         resolve();
  //     } catch(error){
  //         console.error("Error loading data", error);
  //         reject(error);
  //     }
  // });
}

async function getAllPosts(page, perPage) {
  try {
    const posts = await Post.find({})
      .sort({ postDate: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    return posts;
  } catch (err) {
    console.log("Error loading posts", err);
    throw err;
  }

  // return new Promise((resolve, reject) => {
  //     if(board.length == 0){
  //         console.log("No post to display");
  //         reject();
  //     }
  //     resolve(board);
  // })
}

function addPost(data) {
  return new Promise((resolve, reject) => {
    if (!data.author || !data.title || !data.category || !data.content) {
      console.log("Invalid data");
      reject();
    }
    // var id = board[board.length - 1].id + 1;
    // var date = new Date;
    // var [month, day, year] = [
    //     date.getMonth() + 1,
    //     date.getDate(),
    //     date.getFullYear()
    // ]
    // if(month < 10){month = "0" + month;}
    // if(day < 10){day = "0" + day;}
    // var date = `${year}-${month}-${day}`;
    var post = new Post({
      category: data.category,
      title: data.title,
      author: data.author,
      content: data.content,
    });
    if (data.add) {
      post
        .save()
        .then((savedPost) => {
          console.log("Successfully added the post");
          resolve(savedPost);
        })
        .catch((err) => {
          console.log("Unable to add the post", err);
          reject(err);
        });
    } else {
    }
  });
}

async function getPostById(id) {
  try {
    const post = await Post.find({ _id: id });
    return post;
  } catch (err) {
    console.log("Unable to load the posts with the ID", err);
    throw err;
  }

  // return new Promise((resolve, reject) => {
  //     var post = board.find((post) => post.id === parseInt(id));
  //     if(post === undefined){
  //         console.log("Cannot find the post by the id");
  //         reject();
  //         return;
  //     }
  //     resolve(post);
  // })
}

async function getPostByAuthor(author) {
  try {
    const posts = await Post.find({ author: author });
    return posts;
  } catch (err) {
    console.log("Una;ble to load the posts with the author", err);
    throw err;
  }

  // return new Promise((resolve, reject) => {
  //     var posts = board.filter((post) => {
  //         return post.author === author;
  //     });

  //     if(posts.length === 0){
  //         console.log("Cannot find the posts by the author");
  //         reject();
  //         return;
  //     }
  //     resolve(posts);
  // })
}

async function getPostByDate(date) {
  try {
    const posts = await Post.find({ postDate: date });
    return posts;
  } catch (err) {
    console.log("Unable to load the posts with the date", err);
    throw err;
  }

  // return new Promise((resolve, reject) => {
  //     var posts = board.filter((post) => {
  //         return post.postDate === date;
  //     })
  //     console.log(posts);
  //     if (posts.length === 0) {
  //         console.log("Cannot find the posts by the date");
  //         reject();
  //         return;
  //     }
  //     resolve(posts);
  // })
}

async function searchPost(line) {
  try {
    const search = new RegExp(line, "i");

    const posts = await Post.find({
      $or: [{ title: search }, { author: search }, { content: search }],
    });
    return posts;
  } catch (err) {
    console.log("Unable to search post", err);
    throw err;
  }

  // console.log(line);
  // return new Promise((resolve, reject) => {
  //     var posts = board.filter((post) => {
  //         return (
  //           post.title.toLowerCase().includes(line.toLowerCase()) ||
  //           post.author.toLowerCase().includes(line.toLowerCase()) ||
  //           post.author.toLowerCase().includes(line.toLowerCase()) ||
  //           post.content.toLowerCase().includes(line.toLowerCase())
  //         );
  //     })
  //     console.log("posts: ", posts);
  //     if(!posts){
  //         console.log("Nothing does not match with the search");
  //         reject();
  //     }
  //     resolve(posts);
  // })
}

async function signUp(userData) {
  try {
    if (userData.password1 != userData.password2) {
      throw new Error("Passwords do not match!");
    } else {
      const newUser = await new User({
        userName: userData.userName,
        password: userData.password1,
      });
      await newUser.save();
      console.log("New user successfully signed up!");
    }
  } catch (error) {
    if (error.code === 11000) {
      console.log("User name already taken", error);
    } else {
      console.log("There was an error creating the user: " + error);
    }
  }
}

async function checkUser(userData) {
  try {
    const user = await User.find({ userName: userData.userName }).exec();
    if (!user || user.length === 0) {
      throw new Error("Cannot find the user");
    }
    return user[0];
  } catch (error) {
    console.log("There was an error signing up", error);
  }
}

export const boardService = {
  initialize,
  getAllPosts,
  addPost,
  getPostById,
  getPostByAuthor,
  getPostByDate,
  searchPost,
  signUp,
  checkUser,
};
