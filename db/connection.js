const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const getJumlahDosen = (request, response) => {
  const tahun = request.query.tahun ? request.query.tahun : 2023;
  pool.query(
    `SELECT tsdm.id_stat_aktif, COUNT (tsdm.id_sdm) AS total,  MAX(tsdm.last_update) AS last_update
    FROM pdrd.sdm tsdm
    LEFT JOIN pdrd.reg_ptk treg ON treg.id_sdm = tsdm.id_sdm AND treg.soft_delete = 0
    LEFT JOIN pdrd.keaktifan_ptk tkeaktifan ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk AND tkeaktifan.soft_delete = 0
    LEFT JOIN pdrd.satuan_pendidikan tsp ON tsp.id_sp = treg.id_sp AND tsp.soft_delete = 0
    LEFT JOIN pdrd.sms tsms ON tsms.id_sms = treg.id_sms AND tsms.soft_delete = 0
    WHERE tkeaktifan.id_thn_ajaran = ${tahun}
    AND tkeaktifan.a_sp_homebase = 1
    AND tsdm.soft_delete = 0
    AND tsdm.id_jns_sdm = 12
    AND tsp.stat_sp = 'A'
    AND tsms.id_jns_sms = 3
    AND LEFT(tsp.id_wil,2) <> '99'
    AND tsdm.id_stat_aktif IN('1')
    AND treg.id_jns_keluar IS NULL
    GROUP BY tkeaktifan.id_thn_ajaran, tsdm.id_stat_aktif`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getJenjangDosen = (request, response) => {
  pool.query(
    `SELECT
    CASE
        WHEN rjd.nm_jenj_didik in('D1', 'D2', 'D3', 'D4', 'Informal', 'Lainnya', 'Non formal', 'Profesi', 'S1',
        'S2', 'S2 Terapan', 'S3', 'S3 Terapan', 'SMA / sederajat', 'Sp-1', 'Sp-2') THEN rjd.nm_jenj_didik ELSE 'Tanpa Jenjang' END AS jenjang_pendidikan,
        COUNT(DISTINCT prp.id_sdm) AS jml_dosen,
        MAX(ps.last_update) AS last_update
    FROM
        pdrd.reg_ptk AS prp
    INNER JOIN
        pdrd.keaktifan_ptk AS pkp ON prp.id_reg_ptk = pkp.id_reg_ptk
    INNER JOIN
        pdrd.sdm AS ps ON prp.id_sdm = ps.id_sdm
    INNER JOIN
        pdrd.rwy_pend_formal AS prpf ON prp.id_sdm = prpf.id_sdm
    INNER JOIN
        ref.jenjang_pendidikan AS rjd ON prpf.id_jenj_didik = rjd.id_jenj_didik
    WHERE
        ps.id_jns_sdm = 12
    AND
        ps.id_stat_aktif = 1
    AND
        ps.soft_delete = 0
    AND
        pkp.soft_delete = 0
    AND
        prp.soft_delete = 0
    GROUP BY
        rjd.nm_jenj_didik
    ORDER BY
        rjd.nm_jenj_didik`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getJabfungDosen = (request, response) => {
  pool.query(
    `
    SELECT
  CASE
    WHEN rjabfung.nm_jabfung IN ('Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor') THEN rjabfung.nm_jabfung
    ELSE 'Lainnya'
  END AS name,
  COUNT(DISTINCT ps.id_sdm) AS value
FROM pdrd.sdm ps
JOIN pdrd.rwy_fungsional prf ON ps.id_sdm = prf.id_sdm AND prf.soft_delete = 0
JOIN pdrd.reg_ptk treg ON treg.id_sdm = ps.id_sdm AND treg.soft_delete = 0
JOIN pdrd.satuan_pendidikan tsp ON tsp.id_sp = treg.id_sp AND tsp.soft_delete = 0
JOIN pdrd.sms tsms ON tsms.id_sms = treg.id_sms AND tsms.soft_delete = 0
JOIN pdrd.keaktifan_ptk tkeaktifan ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk AND tkeaktifan.soft_delete = 0
JOIN ref.jabfung rjabfung ON prf.id_jabfung = rjabfung.id_jabfung
JOIN ref.jenis_sdm rjenis ON ps.id_jns_sdm = rjenis.id_jns_sdm
JOIN (
  SELECT id_sdm, MAX(id_jabfung) AS max_jabfung
  FROM pdrd.rwy_fungsional
  WHERE soft_delete = 0
  GROUP BY id_sdm
) AS MaxJabfung ON ps.id_sdm = MaxJabfung.id_sdm
WHERE rjenis.nm_jns_sdm = 'Dosen'
  AND tsp.stat_sp = 'A'
  AND tsms.id_jns_sms = 3
  AND ps.soft_delete = 0
  AND LEFT(tsp.id_wil, 2) <> '99'
  AND ps.id_stat_aktif IN ('1', '20', '24', '25', '27')
  AND treg.id_jns_keluar IS NULL
  AND tkeaktifan.a_sp_homebase = 1
GROUP BY
  CASE
    WHEN rjabfung.nm_jabfung IN ('Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor') THEN rjabfung.nm_jabfung
    ELSE 'Lainnya'
  END`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getSertifikasiDosen = (request, response) => {
  pool.query(
    `SELECT
    CASE
      WHEN sls.simpulan_akhir = 'L' THEN 'Lulus'
      WHEN sls.simpulan_akhir = 'T' THEN 'Tidak Lulus'
    END AS simpulan_akhir,
    COUNT(*) as jumlah_sert
  FROM pdrd.rwy_sertifikasi as prs
  JOIN sdid.reg_serdos as sr ON sr.id_sdm = prs.id_sdm
  JOIN sdid.lulus_serdos as sls ON sls.id_usul_dys = sr.id_usul_dys
  WHERE prs.thn_sert = 2023
  AND prs.id_jns_sert IN (1,2)
  GROUP BY simpulan_akhir;`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getGolonganDosen = (request, response) => {
  pool.query(
    `
    SELECT
CASE
	WHEN rpg.kode_gol in('I/a','I/b','I/c','I/d','II/a','II/b','II/c','II/d','III/a','III/b','III/c'
,'III/d','IV/a','IV/b','IV/c','IV/d','IV/e') THEN rpg.kode_gol ELSE 'Tidak Ada Kepangkatan' END AS golongan_kepangkatan,
    COUNT(DISTINCT prp.id_sdm) AS jml_dosen,
    MAX(ps.last_update) AS last_update
FROM
    pdrd.reg_ptk AS prp
INNER JOIN
    pdrd.keaktifan_ptk AS pkp ON prp.id_reg_ptk = pkp.id_reg_ptk
INNER JOIN
    pdrd.sdm AS ps ON prp.id_sdm = ps.id_sdm
INNER JOIN
	pdrd.rwy_pend_formal AS prpf ON prp.id_sdm = prpf.id_sdm
INNER JOIN
	ref.pangkat_golongan AS rpg ON ps.id_pangkat_gol = rpg.id_pangkat_gol
WHERE
    ps.id_jns_sdm = 12
AND
	ps.id_stat_aktif = 1
AND
	ps.soft_delete = 0
AND
	pkp.soft_delete = 0
AND
	prp.soft_delete = 0
GROUP BY
    rpg.kode_gol
ORDER BY
    rpg.kode_gol`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getBentukPendidikan = (request, response) => {
  pool.query(
    `SELECT 
    CASE
        WHEN rik.nm_ikatan_kerja in('Dokter Pendidik Klinis','Dosen dengan Perjanjian Kerja','Dosen PNS DPK','Dosen Tetap','Dosen Tetap BH',
        'Dosen Tidak Tetap','Instruktur','JFT (Jabatan Fungsional Tertentu)','P3K ASN','Tutor') THEN rik.nm_ikatan_kerja ELSE 'Lainnya' END AS name,
        COUNT(DISTINCT tsdm.id_sdm) AS value
    FROM pdrd.sdm AS tsdm
    LEFT JOIN (
        SELECT
            treg.id_sdm,
            treg.id_reg_ptk,
            treg.id_sp,
            treg.id_jns_keluar,
            treg.id_sms,
            treg.id_stat_pegawai,
            treg.id_ikatan_kerja,
            ROW_NUMBER() OVER(PARTITION BY treg.id_sdm ORDER BY treg.last_update DESC) AS rn
        FROM pdrd.reg_ptk AS treg
    ) AS lreg ON tsdm.id_sdm = lreg.id_sdm AND lreg.rn = 1
    LEFT JOIN pdrd.satuan_pendidikan AS tsp ON tsp.id_sp = lreg.id_sp
    LEFT JOIN pdrd.keaktifan_ptk AS pkp ON pkp.id_reg_ptk = lreg.id_reg_ptk
    LEFT JOIN ref.ikatan_kerja_sdm AS rik ON lreg.id_ikatan_kerja = rik.id_ikatan_kerja
    LEFT JOIN pdrd.sms tsms ON tsms.id_sms = lreg.id_sms AND tsms.soft_delete = 0
    WHERE pkp.id_thn_ajaran = 2023
    AND tsdm.soft_delete = 0
    AND tsdm.id_jns_sdm = 12
    AND tsp.stat_sp = 'A'
    AND tsms.id_jns_sms = 3
    AND LEFT(tsp.id_wil,2) <> '99'
    AND tsdm.id_stat_aktif IN('1','20','24','25','27')
    AND lreg.id_jns_keluar IS NULL
    GROUP BY rik.nm_ikatan_kerja`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getUsiaDosen = (request, response) => {
  pool.query(
    `SELECT
    tsdm.jk AS jenis_kelamin,
    CASE
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) < 30 THEN '< 30 tahun'
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) BETWEEN 30 AND 39 THEN '30-39 tahun'
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) BETWEEN 40 AND 49 THEN '40-49 tahun'
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) BETWEEN 50 AND 59 THEN '50-59 tahun'
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) >= 60 THEN '> 60 tahun'
    END AS kelompok_usia,
    COUNT(DISTINCT treg.id_sdm) AS jml_dosen
FROM pdrd.sdm tsdm
LEFT JOIN pdrd.reg_ptk treg ON treg.id_sdm = tsdm.id_sdm AND treg.soft_delete = 0
LEFT JOIN pdrd.keaktifan_ptk tkeaktifan ON tkeaktifan.id_reg_ptk = treg.id_reg_ptk AND tkeaktifan.soft_delete = 0
LEFT JOIN pdrd.satuan_pendidikan tsp ON tsp.id_sp = treg.id_sp AND tsp.soft_delete = 0
LEFT JOIN pdrd.sms tsms ON tsms.id_sms = treg.id_sms AND tsms.soft_delete = 0
WHERE tkeaktifan.a_sp_homebase = 1
AND tsdm.soft_delete = 0
AND tsdm.id_jns_sdm = 12
AND tsp.stat_sp = 'A'
AND tsms.id_jns_sms = 3
AND LEFT(tsp.id_wil,2) <> '99'
AND tsdm.id_stat_aktif IN('1','20','24','25','27')
AND treg.id_jns_keluar IS NULL
GROUP BY
    tsdm.jk,
    CASE
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) < 30 THEN '< 30 tahun'
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) BETWEEN 30 AND 39 THEN '30-39 tahun'
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) BETWEEN 40 AND 49 THEN '40-49 tahun'
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) BETWEEN 50 AND 59 THEN '50-59 tahun'
        WHEN DATEDIFF(YEAR, tsdm.tgl_lahir, GETDATE()) >= 60 THEN '> 60 tahun'
    END
ORDER BY
    tsdm.jk ASC,
    kelompok_usia ASC`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getTrendSerdos = (request, response) => {
  pool.query(
    `
    select p.tahun_sert, count(s.id_rwy_sert) as jml
from sdid.serdik s
join sdid.reg_serdos r on s.id_usul_dys = r.id_usul_dys 
join ref.periode_sert p on p.id_periode_sert = r.id_periode_sert
where s.soft_delete = 0 and p.tahun_sert between 2020 and 2023
group by p.tahun_sert
order by p.tahun_sert`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  getJumlahDosen,
  getJenjangDosen,
  getJabfungDosen,
  getSertifikasiDosen,
  getUsiaDosen,
  getGolonganDosen,
  getBentukPendidikan,
  getTrendSerdos,
};
