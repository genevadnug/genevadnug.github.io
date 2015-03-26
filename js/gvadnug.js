//========================
//Follow button
//========================

String.prototype.trunc = String.prototype.trunc ||
      function (n) {
          return this.length > n ? this.substr(0, n - 1) + '&hellip;' : this;
      };

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function () {
    var cache = {};

    this.tmpl = function tmpl(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
          cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :

          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, " ")
              .split("{{").join("\t")
              .replace(/((^|\}\})[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)\}\}/g, "',$1,'")
              .split("\t").join("');")
              .split("}}").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    };
})();


$(function () {
    var callbackFactory = function (attribute) {
        return function (meetupResponse) {
            $("[" + attribute + "]").each(function () {
                var attr = $(this).attr(attribute);

                var pathComponents = $(this).attr(attribute).split(".");
                var dataToApply = meetupResponse;
                for (var i = 0; i < pathComponents.length; i++) {
                    dataToApply = dataToApply[pathComponents[i]];
                }
                if (dataToApply && dataToApply.constructor == Array) {
                    var templateId = $(this).data("templateId");
                    var html = '';
                    for (var i = 0; i < dataToApply.length; i++) {
                        var data = dataToApply[i];
                        data.index = i;
                        html += tmpl(templateId, data);
                    }

                    $(this).html(html);
                } else {
                    $(this).html(dataToApply);
                }
                
                console.debug("applied " + $(this).attr(attribute));
            });
        }
    };
    $.getJSON('https://api.meetup.com/Geneva-NET-User-Group?photo-host=public&page=20&sig_id=67833332&sig=ef55990d355bf44d22624e35aa3b62424dd59ea4&callback=?',
        callbackFactory("data-meetup-group")
        );

     $.getJSON('https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=Geneva-NET-User-Group&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=67833332&sig=c159d829d9aafad843c08bf625b1593d88546c01&callback=?',
        callbackFactory("data-meetup-next-event"));

    var squareUrlProvider = 'https://images.weserv.nl/?h=60&w=60&t=square&url=';
    $.getJSON('https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=Geneva-NET-User-Group&photo-host=public&page=4&fields=&order=time&status=past&desc=true&sig_id=67833332&sig=bed632114c88e057c669cb33777ac2789fb8aa18&callback=?',
      callbackFactory("data-meetup-past-events"))
    .done(function () {
        var eventIds = [];
        var eventIdStrArr = [];
        $("[data-meetup-event-id]").each(function () {
            var eventId = $(this).data("meetupEventId");
            eventIds[eventId] = 1;
            eventIdStrArr.push(eventId);
        });

        var eventUrlString = eventIdStrArr.join("%2C");
        
        if (eventIds.length > 0) {
            $.getJSON('https://api.meetup.com/2/photos?offset=0&format=json&group_urlname=Geneva-NET-User-Group&only=thumb_link%2Cphoto_album&photo-host=public&page=20&fields=&order=time&desc=True&sig_id=67833332&sig=d8f4c3dd484801ed30ce5ba1fe7261723e109e4a&callback=?',
                function (imgData) {
                    if (imgData.results) {
                        for (var i = 0; i < imgData.results.length; i++) {
                            var currImgData = imgData.results[i];
                            var eventId = currImgData.photo_album.event_id;

                            // Only take first image for each event.
                            if (eventId && eventIds[eventId])
                                delete eventIds[eventId];
                            else {
                                continue;
                            }

                            var $img = $("[data-meetup-event-id='" + eventId + "'] img");
                            $img.attr("src", squareUrlProvider + currImgData.thumb_link.replace(/.*?:\/\//g, "")); $img
                            $img.attr("title", "A pic from this event");
                            $img.attr("alt", "A pic from this event.");
                        }
                    }
                });
        }
    });

});


//========================
//PRELOADER
//========================
$(window).load(function() { // makes sure the whole site is loaded
	$('#status').fadeOut(); // will first fade out the loading animation
	$('#preloader').delay(350).fadeOut('slow');
    // will fade out the white DIV that covers the website.
	$('body').delay(350).css({ 'overflow': 'visible' });
    $('.navbar').removeClass('animated fadeOutUp')
          .addClass('animated fadeInDown')
          .fadeIn();
})
//========================
//CUSTOM SCROLLBAR
//========================
$("html").niceScroll({
    mousescrollstep: 70,
    cursorcolor: "#ea9312",
    cursorwidth: "5px",
    cursorborderradius: "10px",
    cursorborder: "none",
});


//========================
//SMOOTHSCROLL
//========================
$(function() {
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});


//========================
//NAVBAR
//========================
(function ($) {
  $(document).ready(function(){

    // hide .navbar first
    $(".navbar").hide();

    // fade in .navbar
   /* $(function () {
        $(window).scroll(function () {

                 // set distance user needs to scroll before we start fadeIn
            if ($(this).scrollTop() > 40) {
                $('.navbar')
                .removeClass('animated fadeOutUp')
                .addClass('animated fadeInDown')
                .fadeIn();
                
            } else {
                $('.navbar')
                .removeClass('animated fadeInDown')
                .addClass('animated fadeOutUp')
                .fadeOut();
            }
        });
    });*/

});
  }(jQuery));

//========================
//icon hover effect
//========================
$('.pulseanimation img').hover(
       function(){ $(this).addClass('animated pulse') },
       function(){ $(this).removeClass('animated pulse') })