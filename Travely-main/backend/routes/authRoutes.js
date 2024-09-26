const express = require("express");
const passport = require("passport");
const CLIENT_URL = "http://localhost:3000/";
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  resetpasswordrequest,
  resetpassword,
  checkEmailExists,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", resetpasswordrequest);
router.post("/reset-password", resetpassword);
router.get("/check-email", checkEmailExists);

//OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));



router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
      cookies: req.cookies
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});


router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);




module.exports = router;
