var express = require("express");
var router = express.Router();
const {
  trendSerdos,
  trendDosen,
  trendTendik,
  jumlahTendik,
  jumlahDosen22,
  jumlahDosen23,
  prosesPakdit,
} = require("../data");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Akses api berhasil");
});

router.get("/dosen/jumlah", (req, res) => {
  const tahun = req.query.tahun;
  if (tahun === "2023") {
    res.send(jumlahDosen23).status(200);
  }
  if (tahun === "2022") {
    res.send(jumlahDosen22).status(200);
  }
});
router.get("/dosen/trend", (req, res) => {
  res.send(trendDosen).status(200);
});

router.get("/tendik/jumlah", (req, res) => {
  res.send(jumlahTendik).status(200);
});
router.get("/tendik/trend", (req, res) => {
  res.send(trendTendik).status(200);
});

router.get("/serdos/trend", (req, res) => {
  res.send(trendSerdos).status(200);
});

router.get("/proses/pakdit", (req, res) => {
  res.send(prosesPakdit).status(200);
});

module.exports = router;
