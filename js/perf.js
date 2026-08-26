(function () {
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

  function hydrateIframe(iframe) {
    var src = iframe.getAttribute("data-src");
    if (!src || iframe.getAttribute("src")) return;
    iframe.setAttribute("src", src);
  }

  function hydrateBg(el) {
    var bg = el.getAttribute("data-bg");
    if (!bg) return;
    el.style.backgroundImage = 'url("' + bg + '")';
    el.removeAttribute("data-bg");
  }

  var lazyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.tagName === "VIDEO") hydrateVideo(el);
        else if (el.tagName === "SECTION") {
          el.querySelectorAll("iframe[data-src]").forEach(hydrateIframe);
        } else hydrateBg(el);
        lazyObserver.unobserve(el);
      });
    },
    { rootMargin: "240px 0px", threshold: 0.01 }
  );

  document.querySelectorAll("video.js-lazy-video").forEach(function (video) {
    lazyObserver.observe(video);
  });
  document.querySelectorAll("[data-bg]").forEach(function (el) {
    lazyObserver.observe(el);
  });
  document.querySelectorAll("section").forEach(function (section) {
    if (section.querySelector("iframe[data-src]")) lazyObserver.observe(section);
  });

  document.querySelectorAll("video.js-hero-video").forEach(function (video) {
    playVideo(video);
  });

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
      { rootMargin: "500px 0px" }
    );
    commentsObserver.observe(comments);
  }
})();
