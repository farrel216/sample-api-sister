const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token == null) return res.status(401).send({ message: "Unauthorized" });
  if (typeof token !== "undefined") {
    const bearer = token.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, process.env.TOKEN_SECRET, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
};

module.exports = { verifyToken };
