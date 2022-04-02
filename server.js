const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const port = 2070;
let creado = false;


app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("vista", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true,
    })
);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "haikyuu teams",
});

db.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }

    console.log("concetado al servidor con el id" + db.threadId);
});

app.listen(port, () => {
    console.log("el puerto anda mortal ");
});

app.get("/home", (req, res) => {
    let sql = `SELECT * FROM karasuno`;
    db.query(sql, (err, data, fields) => {
        if (err) throw err;
        res.render("index", { data: data, creado: creado });
    });
});

app.get("/login", (req, res) => {
    res.render("Login");
});

app.post("/user", (req, res) => {
    let sql = `SELECT contraseña FROM usuarios WHERE usuario = ?`;
    let contraseña = req.body.contraseña;
    db.query(sql, [req.body.usuario], (err, data, fields) => {
        if (err) throw err;
        bcrypt.compare(contraseña, data[0].contraseña, function (err, result) {
            if (err) throw err;
            if (result == true) {
                creado = true;
                res.redirect("/home");
            } else {
                creado = false;
                console.log("que carajos intentas?");
                res.redirect("/login");
            }
        });
    });
});

app.get("/SingOut", (req, res) => {
    req.session.destroy(function (err) {
        console.log("Destruido por salame");
    });
    res.redirect("login");
});

app.get("/SingUp", (req, res) => {
    res.render("SingUp");
});

app.post("/newuser", (req, res) => {
    let sql = `INSERT INTO usuarios(usuario, contraseña) VALUES (?)`;
    let sql2 = `SELECT * FROM usuarios`;
    db.query(sql2, function (err, data, fields) {
        if (err) throw err;
        let existe = false;
        data.forEach((x) => {
            if (x.usuario == req.body.usuario) {
                existe = true;
                res.render("SingUp");
            }
        });
        if (existe == false) {
            let encriptado = 0;
            bcrypt.hash(req.body.contraseña, 10, function (err, encriptado) {
                let values = [req.body.usuario, encriptado];
                db.query(sql, [values], function (err, data, fields) {
                    if (err) throw err;
                    res.redirect("/login");
                });
            });
        }
    });
});

