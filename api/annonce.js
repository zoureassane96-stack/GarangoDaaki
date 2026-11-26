
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

    const headers = { apikey: anonKey };

    const params = new URLSearchParams({
      select: 'id,title,description,price,city,category,listing_type,status,availability_status,created_at',
      id: `eq.${id}`,
      status: 'eq.published',
      availability_status: 'eq.available'
    });

    const response = await fetch(
      `${supabaseUrl}/rest/v1/listings?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Erreur de récupération de l’annonce');
    }

    const listings = await response.json();
    const listing = listings[0];

    if (!listing) {
      return res.status(404).send('Annonce introuvable ou indisponible');
    }

    const photoParams = new URLSearchParams({
      select: 'image_url',
      listing_id: `eq.${id}`,
      order: 'position.asc'
    });

    const photoResponse = await fetch(
      `${supabaseUrl}/rest/v1/listing_images?${photoParams}`,
      { headers }
    );

    const photos = photoResponse.ok
      ? await photoResponse.json()
      : [];

    const siteUrl = 'https://garangodaaki.vercel.app';

    const pageUrl =
      `${siteUrl}/api/annonce?id=${encodeURIComponent(id)}`;

    const appUrl =
      `${siteUrl}/?annonce=${encodeURIComponent(id)}`;

    const image = photos[0]?.image_url ||
      `${siteUrl}/og-image.jpg`;

    const title = `${listing.title || 'Annonce'} — GarangoDaaki`;

    const price = listing.price != null
      ? Number(listing.price).toLocaleString('fr-FR') + ' FCFA'
      : 'Prix à discuter';

    const description = [
      price,
      listing.city || 'Centre-Est du Burkina Faso',
      listing.description || 'Découvrez cette annonce sur GarangoDaaki.'
    ].join(' · ').slice(0, 300);

        const isProduct = listing.listing_type === 'product';

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      name: title,
      description,
      url: pageUrl,
      inLanguage: 'fr',
      datePublished: listing.created_at,
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: image
      },
      mainEntity: {
        '@type': isProduct ? 'Product' : 'Service',
        '@id': `${pageUrl}#${isProduct ? 'product' : 'service'}`,
        name: listing.title,
        description: listing.description || '',
        image,
        url: appUrl,
        category: listing.category || '',
        ...( !isProduct && listing.city ? {
          areaServed: {
            '@type': 'City',
            name: listing.city
          }
        } : {}),
        offers: {
          '@type': 'Offer',
          url: appUrl,
          ...(listing.price != null ? {
            price: Number(listing.price),
            priceCurrency: 'XOF'
          } : {}),
          ...(isProduct ? {
            availability: 'https://schema.org/InStock'
          } : {})
        }
      }
    };

    const jsonLd = JSON.stringify(schema)
      .replace(/</g, '\\u003c');

    return res
      .status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .setHeader('X-Robots-Tag', 'index, follow')
      .send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index, follow">

<link rel="canonical" href="${escapeHtml(pageUrl)}">

<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:url" content="${escapeHtml(pageUrl)}">
<meta property="og:site_name" content="GarangoDaaki">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">

<script type="application/ld+json">${jsonLd}</script>

<style>
body {
  font-family: Arial, sans-serif;
  background: #f4f7f5;
  color: #18352a;
  margin: 0;
  padding: 20px;
}
main {
  max-width: 700px;
  margin: 25px auto;
  background: white;
  padding: 22px;
  border-radius: 15px;
}
img {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  border-radius: 12px;
  background: #f4f4f4;
}
h1 { font-size: 25px; }
.price {
  color: #08734d;
  font-size: 23px;
  font-weight: bold;
}
a {
  display: inline-block;
  background: #08734d;
  color: white;
  padding: 14px 20px;
  border-radius: 9px;
  text-decoration: none;
  font-weight: bold;
}
</style>
</head>

<body>
<main>
  <p><strong>GarangoDaaki</strong> — Toutes les opportunités du Centre-Est</p>

  ${photos[0]?.image_url
    ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(listing.title)}">`
    : '<p>Photo non disponible</p>'}

  <h1>${escapeHtml(listing.title || 'Annonce')}</h1>

  <p class="price">${escapeHtml(price)}</p>

  <p>📍 ${escapeHtml(listing.city || 'Localité non renseignée')}</p>

  <p>Catégorie : ${escapeHtml(listing.category || 'Autre')}</p>

  <h2>Description</h2>
  <p>${escapeHtml(listing.description || 'Aucune description fournie.')}</p>

  <a href="${escapeHtml(appUrl)}">
    Voir cette annonce sur GarangoDaaki
  </a>
</main>
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
