require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const passport = require("passport");
const FacebookStrategy = require("passport-facebook");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(passport.initialize());

let user;

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.CLIENT_ID_FB,
            clientSecret: process.env.CLIENT_SECRET_FB,
            callbackURL: "https://learn-auth.herokuapp.com/auth/fb/secret",
            profileFields: [
                "id",
                "displayName",
                "picture.type(large)",
                "email",
            ],
        },
        function (accessToken, refreshToken, profile, cb) {
            // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
            //     return cb(err, user);
            // });
            user = { name: profile.displayName, img: profile.photos[0].value };
            return cb(null, profile);
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID_GOOGLE,
            clientSecret: process.env.CLIENT_SECRET_GOOGLE,
            callbackURL: "https://learn-auth.herokuapp.com/auth/google/callback",
        },
        function (accessToken, refreshToken, profile, cb) {
            user = { name: profile.displayName, img: profile.photos[0].value.replace("s96", "s250") };
            cb(null, profile);
        }
    )
);




app.get("/", (req, res) => {
    res.render("index", { title: "Auth" });
});

app.get("/profile", (req, res) => {
    if (!user) {
        res.redirect("/");
    }
    res.render("profile", { user });
});

app.get("/logout", (req, res) => {
    res.redirect("/");
});

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
    "/auth/fb/secret",
    passport.authenticate("facebook", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/profile");
    }
);

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/profile");
    }
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((id, cb) => {
    cb(null, id);
});
app.listen(port, (_) => {
    console.log(`app listen at: http://localhost:${port}`);
});
