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
  ikatanKerja,
  jumlahSerdos,
} = require("../data");

const db = require("../db/connection");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Akses api berhasil");
});

router.get("/dosen", db.getJumlahDosen);

router.get("/dosen/jkusia", (req, res) => {
  res.send(jumlahDosenJKU).status(200);
});
router.get("/dosen/golongan", db.getGolonganDosen);
router.get("/dosen/jabfung", db.getJabfungDosen);
router.get("/dosen/jenjangpend", db.getJenjangDosen);
router.get("/dosen/bentukpend", db.getBentukPendidikan);
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

router.get("/serdos/trend", db.getTrendSerdos);

router.get("/proses/pakdit", (req, res) => {
  res.send(prosesPakdit).status(200);
});
router.get("/serdos/jumlah", db.getSertifikasiDosen);

module.exports = router;
