// SEO component — wraps react-helmet-async to set per-page meta tags, OG tags, Twitter card and JSON-LD schema.
// Usage: <SEO title="..." description="..." keywords="..." schema={...} />

import { Helmet } from "react-helmet-async";

const BASE_URL = "https://hamroyatra.ujjwalrupakheti.com.np";
const DEFAULT_IMAGE = `${BASE_URL}/android-chrome-512x512.png`;

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  schema,
  noIndex = false,
}) => {
  const fullTitle = title
    ? `${title} | HamroYatra`
    : "HamroYatra | Find Verified Travel Agencies & Hotels in Nepal";

  const fullDescription =
    description ||
    "Discover Nepal's finest verified trekking agencies, travel companies and hotels. Compare, review and book your perfect Nepal adventure on HamroYatra.";

  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : null;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        }
      />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="HamroYatra" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
