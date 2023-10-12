var express = require("express");
var router = express.Router();
const {
  trendSerdos,
  trendDosen,
  trendTendik,
  jumlahTendik23,
  jumlahTendik22,
  jumlahDosen22,
  jumlahDosen23,
  prosesPakdit,
  jumlahDosenJKU,
  golonganDosen,
  jabFung,
  jenjangPendidikan,
  bentukPendidikan,
  trendBentukPendidikan,
  ikatanKerja,
  jumlahSerdos,
} = require("../data");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Akses api berhasil");
});

router.get("/dosen/jumlah", (req, res) => {
  const tahun = req.query.tahun;
  switch (tahun) {
    case "2023":
      res.send(jumlahDosen23).status(200);
      break;
    case "2022":
      res.send(jumlahDosen22).status(200);
      break;

    default:
      res.send(jumlahDosen23).status(200);
      break;
  }
});

router.get("/dosen/jkusia", (req, res) => {
  res.send(jumlahDosenJKU).status(200);
});
router.get("/dosen/golongan", (req, res) => {
  res.send(golonganDosen).status(200);
});
router.get("/dosen/jabfung", (req, res) => {
  res.send(jabFung).status(200);
});
router.get("/dosen/jenjangpend", (req, res) => {
  res.send(jenjangPendidikan).status(200);
});
router.get("/dosen/bentukpend", (req, res) => {
  res.send(bentukPendidikan).status(200);
});
router.get("/dosen/trendbentukpend", (req, res) => {
  res.send(trendBentukPendidikan).status(200);
});
router.get("/dosen/ikatankerja", (req, res) => {
  res.send(ikatanKerja).status(200);
});

router.get("/dosen/trend", (req, res) => {
  res.send(trendDosen).status(200);
});

router.get("/tendik/jumlah", (req, res) => {
  const tahun = req.query.tahun;
  switch (tahun) {
    case "2023":
      res.send(jumlahTendik23).status(200);
      break;
    case "2022":
      res.send(jumlahTendik22).status(200);
      break;

    default:
      res.send(jumlahTendik23).status(200);
      break;
  }
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
router.get("/serdos/jumlah", (req, res) => {
  res.send(jumlahSerdos).status(200);
});

module.exports = router;
