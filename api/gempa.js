import axios from "axios";
import cheerio from "cheerio";

/**
 * Vercel Serverless Function
 * URL: /api/gempa
 */
export default async function handler(req, res) {
  // Wajib: method check (biar rapi)
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const url = "https://www.bmkg.go.id/gempabumi/gempabumi-realtime";

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      timeout: 30000
    });

    const html = response.data;

    // Load HTML
    const $ = cheerio.load(html);
    const data = [];

    // Ambil data tabel gempa
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

    // Validasi hasil
    if (data.length === 0) {
      return res.status(404).json({
        error: "Data gempa tidak ditemukan atau struktur BMKG berubah"
      });
    }

    // Header response
    res.setHeader("Content-Type", "application/json; charset=UTF-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");

    // Kirim JSON
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Gagal mengambil data gempa",
      message: err.message
    });
  }
}
