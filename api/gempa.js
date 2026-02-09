import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://www.bmkg.go.id/gempabumi/gempabumi-realtime";

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      },
      timeout: 20000
    });

    const html = response.data;

    const $ = cheerio.load(html);
    const data = [];

    $("table tbody tr").each((_, el) => {
      const td = $(el).find("td");

      if (td.length >= 6) {
        data.push({
          no: $(td[0]).text().trim(),
          waktu: $(td[1]).text().trim(),
          magnitudo: $(td[2]).text().trim(),
          kedalaman: $(td[3]).text().trim(),
          koordinat: $(td[4]).text().trim(),
          wilayah: $(td[5]).text().trim()
        });
      }
    });

    if (!data.length) {
      return res.status(500).json({
        error: "Parsing gagal (HTML BMKG berubah atau diblok)"
      });
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json(data);

  } catch (err) {
    // INI PENTING BIAR KELIHATAN ERROR ASLINYA
    return res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack
    });
  }
}
