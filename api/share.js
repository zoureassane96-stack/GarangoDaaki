export default async function handler(req, res) {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).send('Identifiant manquant');
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return res.status(500).send('Configuration serveur manquante');
    }

    const headers = {
      apikey: anonKey
    };

    const params = new URLSearchParams({
      select: 'id,title,description,price,city,status,availability_status',
      id: `eq.${id}`,
      status: 'eq.published',
      availability_status: 'eq.available'
    });

    const response = await fetch(
      `${supabaseUrl}/rest/v1/listings?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l’annonce');
    }

    const listings = await response.json();
    const listing = listings[0];

    if (!listing) {
      return res.status(404).send('Annonce introuvable ou indisponible');
    }

    const photoParams = new URLSearchParams({
      select: 'image_url',
      listing_id: `eq.${id}`,
      order: 'position.asc',
      limit: '1'
    });

    const photoResponse = await fetch(
      `${supabaseUrl}/rest/v1/listing_images?${photoParams}`,
      { headers }
    );

    const photos = photoResponse.ok
      ? await photoResponse.json()
      : [];

    const siteUrl = 'https://garangodaaki.vercel.app';

    const image = photos[0]?.image_url ||
      `${siteUrl}/og-image.jpg`;

    const title = `${listing.title} — GarangoDaaki`;

    const description =
      `${listing.price != null
        ? Number(listing.price).toLocaleString('fr-FR') + ' FCFA'
        : 'Prix à discuter'} · ${listing.city || 'Burkina Faso'} · ${listing.description || 'Découvrez cette annonce.'}`;

    const pageUrl =
      `${siteUrl}/?annonce=${encodeURIComponent(id)}`;

    return res.status(200).send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="product">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:url" content="${siteUrl}/api/share?id=${encodeURIComponent(id)}">
<meta property="og:site_name" content="GarangoDaaki">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}">
</head>
<body>
<p>Ouverture de l'annonce...</p>
<p><a href="${escapeHtml(pageUrl)}">Voir l'annonce sur GarangoDaaki</a></p>
</body>
</html>`);

  } catch (error) {
    console.error(error);
    return res.status(500).send('Une erreur est survenue');
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}
