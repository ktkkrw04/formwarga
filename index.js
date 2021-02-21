import express from "express";
import multer from "multer";
import opencage from "opencage-api-client";
import { Citizen } from "./modules/citizen/citizen.mjs";
import Sequelize from "sequelize";

// const dbConfig = {
//     HOST: "ec2-18-204-101-137.compute-1.amazonaws.com",
//     USER: "ouoasqnkkmkbdu",
//     PASSWORD: "06c6ebfde85cc6d16c32e871453a4929f14dc4ee57fcb3817591d4f940d06bdd",
//     DB: "dam6k4babcb38b",
//     PORT: "5432",
//     dialect: "postgres",
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000,
//     },
// };

// const sequelize = new Sequelize(
//     "postgres://ouoasqnkkmkbdu:06c6ebfde85cc6d16c32e871453a4929f14dc4ee57fcb3817591d4f940d06bdd@ec2-18-204-101-137.compute-1.amazonaws.com:5432/dam6k4babcb38b"
// );

const sequelize = new Sequelize(
    "postgres://ouoasqnkkmkbdu:06c6ebfde85cc6d16c32e871453a4929f14dc4ee57fcb3817591d4f940d06bdd@ec2-18-204-101-137.compute-1.amazonaws.com:5432/dam6k4babcb38b", {
        dialect: "postgres",
        protocol: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
            },
        },
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.citizen = sequelize.define("citizen", {
    no_kk: {
        type: Sequelize.STRING,
    },
    nik: {
        type: Sequelize.STRING,
    },
    rt: {
        type: Sequelize.STRING,
    },
    nama: {
        type: Sequelize.STRING,
    },
    no_hp: {
        type: Sequelize.STRING,
    },
    alamat: {
        type: Sequelize.STRING,
    },
    jenis_kelamin: {
        type: Sequelize.STRING,
    },
    tanggal_lahir: {
        type: Sequelize.STRING,
    },
    usia: {
        type: Sequelize.INTEGER,
    },
    pekerjaan: {
        type: Sequelize.STRING,
    },
    domisili: {
        type: Sequelize.STRING,
    },
    alamat_asal: {
        type: Sequelize.STRING,
    },
    lokasi: {
        type: Sequelize.STRING,
    },
});

export { db };

const port = process.env.PORT || 8080;
const upload = multer();

const app = express();

// db.sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and re-sync db.");
// });
db.sequelize.sync();

const CitizenModel = db.citizen;
const Op = db.Sequelize.Op;

app.use(upload.array());
app.use(express.urlencoded({ extended: false }));

app.get("/geocode", (req, res) => {
    opencage
        .geocode({
            q: "Kabupaten Purwakarta",
        })
        .then((data) => {
            // console.log(JSON.stringify(data));
            if (data.status.code === 200) {
                if (data.results.length > 0) {
                    let place = data.results[0];
                    return res.send({
                        formatted: place.formatted,
                        geometry: place.geometry,
                        annotations: place.annotations.timezone.name,
                    });
                }
            } else if (data.status.code === 402) {
                console.log("hit free trial daily limit");
                console.log("become a customer: https://opencagedata.com/pricing");
            } else {
                // other possible response codes:
                // https://opencagedata.com/api#codes
                console.log("error", data.status.message);
            }
        })
        .catch((error) => {
            console.log("error", error.message);
        });
});
app.post("/verify", (req, res) => {
    const citizen = new Citizen(req.body.tanggal_lahir);
    let verify = citizen.verify();

    const new_citizen = {
        no_kk: req.body.no_kk,
        nik: req.body.nik,
        rt: req.body.rt,
        nama: req.body.nama,
        no_hp: req.body.no_hp,
        alamat: req.body.alamat,
        jenis_kelamin: req.body.jenis_kelamin,
        usia: verify.age,
        tanggal_lahir: req.body.tanggal_lahir,
        pekerjaan: req.body.pekerjaan,
        domisili: req.body.domisili,
        alamat_asal: req.body.alamat_asal,
        lokasi: req.body.lokasi,
    };

    CitizenModel.create(new_citizen)
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            console.log(err);
        });

    res.render("verify.ejs", {
        verify: citizen.verify(),
    });
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(port, () => {
    console.log(`Server running in localhost:${port}`);
});