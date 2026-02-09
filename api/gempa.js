import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://www.bmkg.go.id/gempabumi/gempabumi-realtime";

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const data = [];

    $("table tbody tr").each((i, el) => {
      const td = $(el).find("td");

      if (td.length >= 6) {
        data.push({
          "#": $(td[0]).text().trim(),
          waktu: $(td[1]).text().trim(),
          magnitudo: $(td[2]).text().trim(),
          kedalaman: $(td[3]).text().trim(),
          koordinat: $(td[4]).text().trim(),
          wilayah: $(td[5]).text().trim()
        });
      }
    });

    if (data.length === 0) {
      return res.status(404).json({
        error: "Tabel gempa tidak ditemukan"
      });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Gagal mengambil data",
      detail: error.message
    });
  }
}
