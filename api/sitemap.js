
export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return res.status(500).send('Configuration serveur manquante');
    }

    const siteUrl = 'https://garangodaaki.vercel.app';
    const headers = {
      apikey: anonKey,
      'Range-Unit': 'items'
    };

    let listings = [];
    let start = 0;
    const pageSize = 1000;

    while (true) {
      const params = new URLSearchParams({
        select: 'id,created_at',
        status: 'eq.published',
        availability_status: 'eq.available',
        order: 'created_at.desc'
      });

      const response = await fetch(
        `${supabaseUrl}/rest/v1/listings?${params}`,
        {
          headers: {
            ...headers,
            Range: `${start}-${start + pageSize - 1}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Impossible de récupérer les annonces');
      }

      const batch = await response.json();

      listings.push(...batch);

      if (batch.length < pageSize) {
        break;
      }

      start += pageSize;
    }

    const urls = [
      {
        loc: `${siteUrl}/`,
        lastmod: new Date().toISOString()
      },

      ...listings.map(item => ({
        loc: `${siteUrl}/api/annonce?id=${encodeURIComponent(item.id)}`,
        lastmod: item.created_at
          ? new Date(item.created_at).toISOString()
          : null
      }))
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(item => `
  <url>
    <loc>${escapeXml(item.loc)}</loc>
    ${item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : ''}
  </url>
`).join('')}
</urlset>`;

    res.status(200);

res.setHeader(
  'Content-Type',
  'application/xml; charset=utf-8'
);

res.setHeader(
  'Cache-Control',
  'public, s-maxage=300, stale-while-revalidate=600'
);

return res.send(xml);

  } catch (error) {
    console.error(error);
    return res.status(500).send('Erreur lors de la génération du sitemap');
  }
}

function escapeXml(value) {
  return String(value ?? '').replace(/[<>&"']/g, char => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;'
  })[char]);
}
g
