import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import opencage from "opencage-api-client";
import { Citizen } from "./modules/citizen/citizen.mjs";

const port = process.env.PORT || 8080;
const upload = multer();

const app = express();
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
    // console.log(req.body);
    const citizen = new Citizen(req.body.tanggal_lahir);

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