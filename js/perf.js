(function () {
  var heroStarted = false;

  function playVideo(video) {
    var play = video.play();
    if (play && play.catch) play.catch(function () {});
  }

  function hydrateVideo(video) {
    if (video.dataset.hydrated === "true") return;
    var sources = video.querySelectorAll("source[data-src]");
    if (!sources.length && !video.dataset.src) return;

    sources.forEach(function (source) {
      source.src = source.getAttribute("data-src");
    });
    if (video.dataset.src) video.src = video.dataset.src;
    video.load();
    video.dataset.hydrated = "true";
    if (video.dataset.poster) {
      video.style.backgroundImage = 'url("' + video.dataset.poster + '")';
    }
    playVideo(video);
  }

  function hydrateBg(el) {
    var bg = el.getAttribute("data-bg");
    if (!bg) return;
    el.style.backgroundImage = 'url("' + bg + '")';
    el.removeAttribute("data-bg");
  }

  function cleanEmbedUrl(url) {
    return url.split("?")[0] + "?utm_source=generator";
  }

  function openUrlFromEmbed(embedUrl) {
    return embedUrl
      .replace("/embed/track/", "/track/")
      .replace("/embed/artist/", "/artist/")
      .split("?")[0];
  }

  function wrapSpotifyIframes() {
    document.querySelectorAll('iframe[data-embed*="open.spotify.com"]').forEach(function (iframe) {
      if (iframe.parentElement && iframe.parentElement.classList.contains("spotify-embed")) return;
      var wrap = document.createElement("div");
      wrap.className = "spotify-embed";
      iframe.parentNode.insertBefore(wrap, iframe);
      wrap.appendChild(iframe);

      var fallback = document.createElement("a");
      fallback.className = "spotify-fallback";
      fallback.href = openUrlFromEmbed(iframe.getAttribute("data-embed") || "");
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.textContent = "Open in Spotify";
      wrap.appendChild(fallback);
    });
  }

  function activateIframe(iframe) {
    if (!iframe) return;
    var url = iframe.getAttribute("data-embed");
    if (!url) return;
    if (iframe.getAttribute("src") === cleanEmbedUrl(url) || iframe.dataset.activated === "true") return;
    iframe.dataset.activated = "true";
    iframe.setAttribute("loading", "eager");
    iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.src = cleanEmbedUrl(url);
  }

  function visibleSliderIframe(slider) {
    var slides = slider.querySelectorAll(".w-slide");
    var origin = slider.getBoundingClientRect().left;
    var closest = null;
    var closestDist = Infinity;
    slides.forEach(function (slide) {
      var dist = Math.abs(slide.getBoundingClientRect().left - origin);
      if (dist < closestDist) {
        closestDist = dist;
        closest = slide.querySelector("iframe[data-embed]");
      }
    });
    return closest;
  }

  function loadVisibleSpotify() {
    document.querySelectorAll(".slider.w-slider").forEach(function (slider) {
      activateIframe(visibleSliderIframe(slider));
    });
  }

  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    document.querySelectorAll("video.js-hero-video").forEach(function (video) {
      video.preload = "auto";
      playVideo(video);
    });
  }

  wrapSpotifyIframes();

  var lazyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.tagName === "VIDEO") hydrateVideo(el);
        else if (el.classList.contains("slider")) loadVisibleSpotify();
        else if (el.classList.contains("album-section") || el.classList.contains("div-block-23")) {
          el.querySelectorAll("iframe[data-embed]").forEach(activateIframe);
        } else hydrateBg(el);
        lazyObserver.unobserve(el);
      });
    },
    { rootMargin: "200px 0px", threshold: 0.01 }
  );

  document.querySelectorAll("video.js-lazy-video").forEach(function (video) {
    lazyObserver.observe(video);
  });
  document.querySelectorAll("[data-bg]").forEach(function (el) {
    lazyObserver.observe(el);
  });
  document.querySelectorAll(".slider, .album-section, .div-block-23").forEach(function (el) {
    lazyObserver.observe(el);
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest(".w-slider-arrow-left, .w-slider-arrow-right, .w-slider-nav, .w-slider-dot")) {
      window.setTimeout(loadVisibleSpotify, 520);
    }
  });

  window.addEventListener("load", startHero);
  setTimeout(startHero, 400);

  function loadScript(src, attrs) {
    var script = document.createElement("script");
    script.src = src;
    Object.keys(attrs || {}).forEach(function (key) {
      script.setAttribute(key, attrs[key]);
    });
    document.body.appendChild(script);
  }

  var thirdPartyLoaded = false;
  function loadThirdParty() {
    if (thirdPartyLoaded) return;
    thirdPartyLoaded = true;
    loadScript("https://www.google.com/recaptcha/api.js");
    var sparks = document.createElement("script");
    sparks.type = "module";
    sparks.src = "https://supersparks.s3.ca-central-1.amazonaws.com/comment/index.js?cacheblock=true";
    sparks.setAttribute("project", "1757596343033x896922969167915600");
    sparks.setAttribute("environment", "production");
    document.body.appendChild(sparks);
  }

  var comments = document.querySelector(".social-reviews-wrapper");
  if (comments) {
    var commentsObserver = new IntersectionObserver(
      function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          loadThirdParty();
          commentsObserver.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    commentsObserver.observe(comments);
  }
})();
