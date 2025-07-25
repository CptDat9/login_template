var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var createError = require("http-errors");

var authRouter = require("./routes/auth");
var usersRouter = require("./routes/users");
var cors = require("cors");
const jwt = require("jsonwebtoken");

var app = express();
// Thêm route test
app.get("/", (req, res) => {
  res.send("Server is running. Try /auth or /users with JWT.");
});

const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const mongoose = require("mongoose");
const dbUrl = require("./config/database");
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("MongoDB Connected");
});

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Library API",
      version: "1.0.0",
    },
  },
  apis: ["./routes/users.js", "./routes/auth.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/users", jwtVerify, usersRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

function jwtVerify(req, res, next) {
  console.log("verifying token...");

  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1]; // Bearer <token>
    try {
      result = jwt.verify(token, "qwertyuiopasdfghjklzxcvbnm123456");
      req.decoded = result;
      next();
    } catch (err) {
      result = {
        error: `Unauthorized`,
        status: 401,
      };
      res.status(401).send(result);
    }
  } else {
    result = {
      error: `Unauthorized error. Token required.`,
      status: 401,
    };
    res.status(401).send(result);
  }
}

module.exports = app;
