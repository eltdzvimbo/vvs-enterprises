(function () {
  var heroStarted = false;

  function updateDynamicYears() {
    var year = new Date().getFullYear();
    document.querySelectorAll(".js-current-year, [data-auto-year]").forEach(function (el) {
      el.textContent = year;
    });
  }
  updateDynamicYears();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateDynamicYears);
  }

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
    if (url.indexOf("open.spotify.com") !== -1) {
      return url.split("?")[0] + "?utm_source=generator";
    }
    return url;
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
        else if (
          el.classList.contains("album-section") ||
          el.classList.contains("div-block-23") ||
          el.classList.contains("vvs-video-grid")
        ) {
          el.querySelectorAll("iframe[data-embed]").forEach(activateIframe);
          el.querySelectorAll("video").forEach(hydrateVideo);
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
  document.querySelectorAll(".slider, .album-section, .div-block-23, .vvs-video-grid").forEach(function (el) {
    lazyObserver.observe(el);
  });

  document.querySelectorAll(".vvs-reel-preview").forEach(function (video) {
    lazyObserver.observe(video);
  });

  // Hover play for video preview cards
  document.querySelectorAll(".vvs-video-card").forEach(function (card) {
    var vid = card.querySelector("video");
    if (!vid) return;
    card.addEventListener("mouseenter", function () {
      hydrateVideo(vid);
      playVideo(vid);
    });
  });

  // Video Modal Controller
  var modal = document.getElementById("vvs-video-modal");
  var modalVideo = document.getElementById("vvs-modal-video");
  var modalTitle = document.getElementById("vvs-modal-title");
  var modalBadge = document.getElementById("vvs-modal-badge");
  var modalDesc = document.getElementById("vvs-modal-desc");
  var modalYtBtn = document.getElementById("vvs-modal-yt-btn");

  function openVideoModal(card) {
    if (!modal || !modalVideo || !card) return;
    var src = card.getAttribute("data-video-src") || "";
    var title = card.getAttribute("data-video-title") || "VVS Video";
    var desc = card.getAttribute("data-video-desc") || "";
    var badge = card.getAttribute("data-badge") || "EXCLUSIVE";
    var ytUrl = card.getAttribute("data-yt-url") || "";

    if (modalTitle) modalTitle.textContent = title;
    if (modalBadge) modalBadge.textContent = badge;
    if (modalDesc) modalDesc.textContent = desc;

    if (modalYtBtn) {
      if (ytUrl) {
        modalYtBtn.href = ytUrl;
        modalYtBtn.style.display = "inline-flex";
      } else {
        modalYtBtn.style.display = "none";
      }
    }

    modalVideo.src = src;
    modalVideo.load();
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    var playPromise = modalVideo.play();
    if (playPromise && playPromise.catch) playPromise.catch(function () {});
  }

  function closeVideoModal() {
    if (!modal || !modalVideo) return;
    modal.classList.remove("is-open");
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function (event) {
    var card = event.target.closest(".vvs-video-card");
    if (card) {
      event.preventDefault();
      openVideoModal(card);
      return;
    }
    if (event.target.closest(".vvs-modal-close") || event.target.classList.contains("vvs-modal-backdrop")) {
      event.preventDefault();
      closeVideoModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
      closeVideoModal();
    }
  });

  function fastSmoothScrollTo(targetEl) {
    if (!targetEl) return;
    var navOffset = window.innerWidth <= 767 ? 20 : 40;
    var rect = targetEl.getBoundingClientRect();
    var targetY = Math.max(0, rect.top + window.pageYOffset - navOffset);
    var startY = window.pageYOffset;
    var diff = targetY - startY;
    if (Math.abs(diff) < 2) return;

    var startTime = null;
    var duration = Math.min(500, Math.max(260, Math.abs(diff) * 0.28));

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var ease = easeOutQuart(progress);
      window.scrollTo(0, startY + diff * ease);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  // Intercept anchor clicks instantly with zero delay
  document.addEventListener(
    "click",
    function (event) {
      var anchor = event.target.closest(".new-video-float, a[href='#latest-video'], a[href='#Videos'], a[href='#Music']");
      if (!anchor) return;

      var href = anchor.getAttribute("href");
      var targetSelector = href && href.startsWith("#") ? href : "#latest-video";
      var target = document.querySelector(targetSelector) || (targetSelector === "#latest-video" ? document.querySelector("#Videos") : null);
      if (!target) return;

      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();

      fastSmoothScrollTo(target);

      var video = target.querySelector("video");
      if (video && video.preload !== "auto") {
        video.preload = "auto";
      }
      var iframe = target.querySelector("iframe[data-embed]");
      if (iframe) {
        activateIframe(iframe);
      }
    },
    true
  );

  var floatBtn = document.querySelector(".new-video-float");
  var latestVideo = document.querySelector("#latest-video");
  if (floatBtn && latestVideo) {
    var hideFloat = new IntersectionObserver(
      function (entries) {
        floatBtn.classList.toggle("is-hidden", entries.some(function (entry) {
          return entry.isIntersecting;
        }));
      },
      { threshold: 0.35 }
    );
    hideFloat.observe(latestVideo);
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest(".w-slider-arrow-left, .w-slider-arrow-right, .w-slider-nav, .w-slider-dot")) {
      window.setTimeout(loadVisibleSpotify, 80);
      window.setTimeout(loadVisibleSpotify, 260);
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
