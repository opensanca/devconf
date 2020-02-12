jQuery(document).ready(function($) {
  $(function() {
    $(".show-modal-info").click(function(e) {
      e.preventDefault();
      var el = $(this),
        modal = $("#speakersModal"),
        speakerContainer = el.closest(".speaker__profile-info");

      modal.find("#modalTitle").text(speakerContainer.data("name"));
      modal.find("#modalBody").text(speakerContainer.data("bio"));
      modal.modal("toggle");
    });

    $('a[href*="#"]:not([href="#"])').click(function() {
      if (
        location.pathname.replace(/^\//, "") ==
          this.pathname.replace(/^\//, "") &&
        location.hostname == this.hostname
      ) {
        var target = $(this.hash);
        target = target.length
          ? target
          : $("[name=" + this.hash.slice(1) + "]");
        if (target.length) {
          $("html, body").animate(
            {
              scrollTop: target.offset().top
            },
            1000
          );
          return false;
        }
      }
    });
  });

  var modalTriggerBts = $('a[data-type="cd-modal-trigger"]'),
    coverLayer = $(".cd-cover-layer");

  var duration = 600,
    epsilon = 1000 / 60 / duration / 4,
    firstCustomMinaAnimation = bezier(0.63, 0.35, 0.48, 0.92, epsilon);

  modalTriggerBts.each(function() {
    initModal($(this));
  });

  function initModal(modalTrigger) {
    var modalTriggerId = modalTrigger.attr("id"),
      modal = $('.cd-modal[data-modal="' + modalTriggerId + '"]'),
      svgCoverLayer = modal.children(".cd-svg-bg"),
      paths = svgCoverLayer.find("path"),
      pathsArray = [];
    //store Snap objects
    (pathsArray[0] = Snap("#" + paths.eq(0).attr("id"))),
      (pathsArray[1] = Snap("#" + paths.eq(1).attr("id"))),
      (pathsArray[2] = Snap("#" + paths.eq(2).attr("id")));

    //store path 'd' attribute values
    var pathSteps = [];
    pathSteps[0] = svgCoverLayer.data("step1");
    pathSteps[1] = svgCoverLayer.data("step2");
    pathSteps[2] = svgCoverLayer.data("step3");
    pathSteps[3] = svgCoverLayer.data("step4");
    pathSteps[4] = svgCoverLayer.data("step5");
    pathSteps[5] = svgCoverLayer.data("step6");

    //open modal window
    modalTrigger.on("click", function(event) {
      event.preventDefault();
      modal.addClass("modal-is-visible");
      coverLayer.addClass("modal-is-visible");
      animateModal(pathsArray, pathSteps, duration, "open");
    });

    //close modal window
    modal.on("click", ".modal-close", function(event) {
      event.preventDefault();
      modal.removeClass("modal-is-visible");
      coverLayer.removeClass("modal-is-visible");
      animateModal(pathsArray, pathSteps, duration, "close");
    });
  }

  function animateModal(paths, pathSteps, duration, animationType) {
    var path1 = animationType == "open" ? pathSteps[1] : pathSteps[0],
      path2 = animationType == "open" ? pathSteps[3] : pathSteps[2],
      path3 = animationType == "open" ? pathSteps[5] : pathSteps[4];
    paths[0].animate({ d: path1 }, duration, firstCustomMinaAnimation);
    paths[1].animate({ d: path2 }, duration, firstCustomMinaAnimation);
    paths[2].animate({ d: path3 }, duration, firstCustomMinaAnimation);
  }

  function bezier(x1, y1, x2, y2, epsilon) {
    //https://github.com/arian/cubic-bezier
    var curveX = function(t) {
      var v = 1 - t;
      return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
    };

    var curveY = function(t) {
      var v = 1 - t;
      return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
    };

    var derivativeCurveX = function(t) {
      var v = 1 - t;
      return (
        3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (-t * t * t + 2 * v * t) * x2
      );
    };

    return function(t) {
      var x = t,
        t0,
        t1,
        t2,
        x2,
        d2,
        i;

      // First try a few iterations of Newton's method -- normally very fast.
      for (t2 = x, i = 0; i < 8; i++) {
        x2 = curveX(t2) - x;
        if (Math.abs(x2) < epsilon) return curveY(t2);
        d2 = derivativeCurveX(t2);
        if (Math.abs(d2) < 1e-6) break;
        t2 = t2 - x2 / d2;
      }

      (t0 = 0), (t1 = 1), (t2 = x);

      if (t2 < t0) return curveY(t0);
      if (t2 > t1) return curveY(t1);

      // Fallback to the bisection method for reliability.
      while (t0 < t1) {
        x2 = curveX(t2);
        if (Math.abs(x2 - x) < epsilon) return curveY(t2);
        if (x > x2) t0 = t2;
        else t1 = t2;
        t2 = (t1 - t0) * 0.5 + t0;
      }

      // Failure
      return curveY(t2);
    };
  }

  //set your google maps parameters
  var latitude = -21.983059,
    longitude = -47.882570,
    map_zoom = 15;

  //google map custom marker icon - .png fallback for IE11
  var is_internetExplorer11 =
    navigator.userAgent.toLowerCase().indexOf("trident") > -1;
  var marker_url = is_internetExplorer11
    ? "assets/img/cd-icon-location.png"
    : "assets/img/cd-icon-location.svg";

  //define the basic color of your map, plus a value for saturation and brightness
  var main_color = "#4a0864",
    saturation_value = -20,
    brightness_value = 5;

  //we define here the style of the map
  var style = [
    {
      //set saturation for the labels on the map
      elementType: "labels",
      stylers: [{ saturation: saturation_value }]
    },
    {
      //poi stands for point of interest - don't show these lables on the map
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      //don't show highways lables on the map
      featureType: "road.highway",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      //don't show local road lables on the map
      featureType: "road.local",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }]
    },
    {
      //don't show arterial road lables on the map
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }]
    },
    {
      //don't show road lables on the map
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ visibility: "off" }]
    },
    //style different elements on the map
    {
      featureType: "transit",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "poi",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "poi.government",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "poi.sport_complex",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "poi.attraction",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "poi.business",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "transit",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "transit.station",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "landscape",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        { hue: main_color },
        { visibility: "on" },
        { lightness: brightness_value },
        { saturation: saturation_value }
      ]
    }
  ];

  //set google map options
  var map_options = {
    center: new google.maps.LatLng(latitude, longitude),
    zoom: map_zoom,
    panControl: false,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    styles: style
  };
  //inizialize the map
  var map = new google.maps.Map(
    document.getElementById("google-container"),
    map_options
  );
  //add a custom marker to the map
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(latitude, longitude),
    map: map,
    visible: true,
    icon: marker_url
  });

  //add custom buttons for the zoom-in/zoom-out on the map
  function CustomZoomControl(controlDiv, map) {
    //grap the zoom elements from the DOM and insert them in the map
    var controlUIzoomIn = document.getElementById("cd-zoom-in"),
      controlUIzoomOut = document.getElementById("cd-zoom-out");
    controlDiv.appendChild(controlUIzoomIn);
    controlDiv.appendChild(controlUIzoomOut);

    // Setup the click event listeners and zoom-in or out according to the clicked element
    google.maps.event.addDomListener(controlUIzoomIn, "click", function() {
      map.setZoom(map.getZoom() + 1);
    });
    google.maps.event.addDomListener(controlUIzoomOut, "click", function() {
      map.setZoom(map.getZoom() - 1);
    });
  }

  var zoomControlDiv = document.createElement("div");
  var zoomControl = new CustomZoomControl(zoomControlDiv, map);

  //insert the zoom div on the top left of the map
	map.controls[google.maps.ControlPosition.LEFT_TOP].push(zoomControlDiv);

});
