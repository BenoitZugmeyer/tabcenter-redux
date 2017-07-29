(() => {
  const result = [];

  function absoluteURL(url) {
    return new URL(url, location).href;
  }

  function parseSizes(sizes) {
    if (!sizes) {
      return 0;
    }

    if (sizes === "any") {
      return "any";
    }

    const match = /^\d+/.exec(sizes);
    if (!match) {
      return 0;
    }

    return Number(match[0]);
  }

  const icons = document.querySelectorAll("link[rel~=icon]");
  for (const icon of icons) {
    result.push({
      href: icon.href,
      type: "icon-link",
      size: parseSizes(icon.getAttribute("sizes"))
    });
  }

  const touchIcons = document.querySelectorAll("link[rel=apple-touch-icon]");
  for (const touchIcon of touchIcons) {
    result.push({
      href: touchIcon.href,
      type: "apple-touch-icon",
      size: "any"
    });
  }

  const maskIcons = document.querySelectorAll("link[rel=mask-icon]");
  for (const maskIcon of maskIcons) {
    result.push({
      href: maskIcon.href,
      type: "maskIcon",
      size: "any",
      color: maskIcon.getAttribute("color")
    });
  }

  // Ex: apple.com
  const jsonld = document.querySelector("script[type='application/ld+json']");
  if (jsonld) {
    let data;
    try {
      data = JSON.parse(jsonld.innerText);
    } catch (e) {
      // Ignore exception
    }
    if (data && data.logo) {
      result.push({
        href: data.logo,
        type: "json-ld",
        size: "any"
      });
    }
  }

  const images = document.querySelectorAll("meta[itemprop=image]");
  for (const image of images) {
    result.push({
      href: absoluteURL(image.getAttribute("content")),
      type: "image-meta",
      size: "any"
    });
  }

  // Ex: facebook.com
  const ogImages = document.querySelectorAll("meta[property='og:image']");
  for (const ogImage of ogImages) {
    result.push({
      href: absoluteURL(ogImage.getAttribute("content")),
      type: "open-graph",
      size: "any"
    });
  }

  return result;
})()
