/*
Include the library using bower or script tag
Example of initializing overflowTabs

	You can call once container div is inserted:

	overflowTabs.init({
		container: "#some-div-id", // id of the main div holding the tabs
		showFirstLast: true, // show first and last buttons in addition to next and previous
		tabSelection: true, // add class of 'active' to clicked tab
		margin: [0, 50, 0, 50], // specify margin in pixels, if different from default [0, 0, 0, 0] where values are [top, right, bottom, left]
		buttonWidth: 20 // if changing it from default 25 pixel width, adjust CSS to set proper width for buttons (or links) .tab-nav button or .tab-nav a
	});

	Or you can also define all options outside load, resize, etc. events:

	var options = {...};
	$(window).resize(function() {
		overflowTabs.init(options);
	});
	$(function() {
		overflowTabs.init(options);
	};

Some CSS is necessary to get tabs look properly
Sample CSS
	<style>
		.overflow-tabs-wrapper {
			width: 100%;
			overflow:hidden;
			border: 0px solid #999;
			position: relative;
			margin: 0 0 -1px 0;
			padding: 0;
		}
		.overflow-tabs-container {
			margin: 0 50px;
			overflow: hidden;
		}
		.tab-list {
			margin: 0;
			padding: 0;
			list-style: none;
			display: block;
			position: relative;
		}
		.tab-list li {
			display: table-cell;
			text-align: left;
			white-space: nowrap;
			padding-right: 10px;
			cursor: pointer;
		}
		.tab-list li.hidden {
			visibility: hidden;
		}
		.tab-list li > div {
			background-color: #eaeaea;
			padding: 5px 10px;
			border: 1px solid #cdcdcd;
			border-bottom: none;
			text-align: left;
		}
		.tab-list li.active > div {
			background-color: white;
		}
		.tab-ellipsis {
			position: absolute;
			height: 25px;
			cursor: pointer;
			top: -10000px;
			left: -10000px;
			background-color: #eaeaea;
			font-weight: bold;
			font-size: 13px;
		}
		.tab-ellipsis.left {
			text-align: left;
			padding: 5px 0 0 2px;
		}
		.tab-ellipsis.right {
			text-align: right;
			padding: 5px 2px 0 0;
		}
		.tab-ellipsis.active {
			background-color: #fff;
		}
		.tab-ellipsis.transparent {
			background-color: transparent;
		}
		.tab-nav a.disabled {
			opacity: 0.2;
		}
		.tab-nav {
			position: absolute;
			text-align: center;
			font-size: 20px;
			top: 0;
		}
		.tab-nav.left {
			left: 0;
		}
		.tab-nav.right {
			right: 0;
		}
		.tab-nav a {
			width: 25px;
			display: inline-block;
			float: left;
			cursor: pointer;
		}
	</style>
*/

var overflowTabs = {

	wrapper: null,
	container: null,
	tabs: null,
	li: null,
	ell: null,
	ellWidth: 0,
	liPad: 0,
	nav: null,
	navOffset: 0,
	vars: {},

	init: function(vars) {

		var o = overflowTabs;

		if (!vars) vars = {};
		o.vars = vars;

		var parent = (vars.container) ? vars.container : "";

		o.wrapper = $(parent + " .overflow-tabs-wrapper");
		o.container = $(parent + " .overflow-tabs-container");
		o.tabs = o.container.find(".tab-list");
		o.li = o.tabs.find("li");
		o.ell = o.wrapper.find(".tab-ellipsis");
		o.ellWidth = o.ell[0].scrollWidth;
		o.liPad = parseInt($(o.li[0]).css("padding-right"));
		o.nav = o.container.find(".tab-nav");
		o.margin = vars.margin || [0, 0, 0, 0];
		o.buttonWidth = vars.buttonWidth || 25;

		if (!Array.isArray(o.margin)) {
			alert("Invalid margin setting. Please format it like [x, x, x, x].");
		}
		if (o.margin.length !== 4) {
			alert("Invalid margin setting. Please format it like [x, x, x, x] with 4 values for top, right, bottom, and left in pixels.");
		}

		if (o.tabs[0].scrollWidth <= o.container.outerWidth()) { // all tabs fit within the container
			o.nav.hide();
			o.navOffset = 0;
			o.container.css("margin", o.margin[0] + "px " + o.margin[1] + "px " + o.margin[2] + "px " + o.margin[3] + "px");
		} else { // there's overflow
			o.nav.show(); // show tab navigation
			o.nav.find(".back, .forward").show();

			if (o.vars.showFirstLast) {
				o.navOffset = o.buttonWidth * 2; // 50
				o.container.css("margin", o.margin[0] + "px " + (o.margin[1] + (o.buttonWidth * 2)) + "px " + o.margin[2] + "px " + (o.margin[3] + (o.buttonWidth * 2)) + "px");
			} else {
				o.nav.find(".first, .last").hide();
				o.navOffset = + (o.buttonWidth); // 25
				o.container.css("margin", o.margin[0] + "px " + (o.margin[1] + o.buttonWidth) + "px " + o.margin[2] + "px " + (o.margin[3] + o.buttonWidth) + "px");
			}
		}
		// Set navigation buttons positions according to margin settings
		$(o.nav).filter('.left').css({left: o.margin[3] + 'px'})
		$(o.nav).filter('.right').css({right: o.margin[1] + 'px'})

		o.draw();

		o.ell.unbind().click(function(e) {
			var el = $(this);
			el.css({left: "-10000px", top: "-10000px"});

			var click = jQuery.Event("click", { pageX: e.pageX, pageY: e.pageY } );
				mouseDown = jQuery.Event("mousedown", { pageX: e.pageX, pageY: e.pageY }),
				mouseUp = jQuery.Event("mouseup", { pageX: e.pageX, pageY: e.pageY }),
				elem = document.elementFromPoint(click.pageX, click.pageY),
				e = $(elem);

			if (elem.tagName != "LI") {
				var side = el.hasClass("right") ? "right": "left";
				e = o.tabs.find("li.partial." + side);
			}

			e.children("div").first().click();
		});

		o.li.unbind().click(function() {
			var e = $(this),
				pixels = (isNaN(parseInt(e.attr("rel")))) ? null : Math.round(e.attr("rel")),
				dir = (e.hasClass("left"))? "b" : "f";

			o.revealTab(e, true, dir, pixels);
		});

		o.nav.find(".first").unbind().click(function() {
			if ($(this).hasClass("disabled")) return false;
			o.container.scrollTo(0);
			o.draw();
		});

		o.nav.find(".last").unbind().click(function() {
			if ($(this).hasClass("disabled")) return false;
			o.container.scrollTo(o.tabs[0].scrollWidth);
			o.draw();
		});

		o.nav.find(".back").unbind().click(function() {
			if ($(this).hasClass("disabled")) return false;
			var e = $("li.partial.left");
			if (e.length > 0) {
				if (!isNaN(parseInt(e.attr("rel")))) o.revealTab(e, false, "b", Math.ceil(e.attr("rel")));
			} else {
				if ($("li.revealed").length > 0) {
					var prev = $("li.revealed").prevAll("li").last();
					o.revealTab(prev, false, "b");
				} else if ($("li.active").length > 0) {
					var prev = $("li.active").prevAll("li").last();
					o.revealTab(prev, false, "b");
				}
			}
		});

		o.nav.find(".forward").unbind().click(function() {
			if ($(this).hasClass("disabled")) return false;
			var e = $("li.partial.right");
			if (e.length > 0) {
				if (!isNaN(parseInt(e.attr("rel")))) o.revealTab(e, false, "f", Math.ceil(e.attr("rel")));
			} else {
				if ($("li.revealed").length > 0) {
					var next = $("li.revealed ~ li").first();
					o.revealTab(next, false, "f");
				} else if ($("li.active").length > 0) {
					var next = $("li.active ~ li").first();
					o.revealTab(next, false, "f");
				}
			}
		});
	},

	revealTab: function(tab, click, dir, pixels) {

		if (tab.length == null) return;
		var e = tab, o = this, n;

		o.li.removeClass("revealed");

		if (click) {
			if (o.vars.tabSelection) {
				o.li.removeClass("active");
				e.addClass("active");
			}
			if (!e.hasClass('partial')) return;
		}
		if (pixels) {
			n = (dir === "b") ? o.container.scrollLeft() - pixels : o.container.scrollLeft() + pixels;
			o.container.scrollTo(n)
		} else {
			n = o.container.scrollLeft() + e.outerWidth(true);
			(dir === "b") ? o.container.scrollTo(e) : o.container.scrollTo(n);
		}

		e.removeClass("hidden");
		e.addClass("revealed");

		o.draw();
	},

	draw: function() {

		var o = this,
			last = o.li.last(),
			first = o.li.first(),
			revealWidth, a, b, c, d, diff;

		o.ell.css({left: "-1000px", top: "-1000px"}).removeClass("active transparent");
		o.li.attr("style", "");

		o.li.each(function(i) {

			var e = $(this),
				revealWidth = 0,
				cOffset = Math.ceil(o.container.offset().left + o.container.outerWidth()), // container's left offset plus its width
				el, eWidth, eOffset;

			if (o.vars.tabSelection) {
				if (o.tabs.find("li.active").length == 0 && i == 0) {
					e.addClass("active");
					$(".first").addClass("disabled");
					$(".back").addClass("disabled");
				}
			}

			e.removeClass("partial left right hidden");
			e.attr("rel", "");

			if (e.hasClass("revealed")) return;

			a = Math.floor(e.offset().left);
			b = o.container.offset().left;

			// Partially hidden Tab is to the left
			if (a < b) {

				eWidth = Math.floor(e.outerWidth(true));
				eOffset = (Math.floor(e.offset().left) + eWidth);

				c = eOffset; // left position plus element (li) width
				d = o.container.offset().left; // container width
				diff = Math.abs(c - d);

				// Partially hidden Tab is to the left
				if ((c > d) && (diff > 1)) {
					el = o.wrapper.find(".tab-ellipsis.left");
					el.css("top", "1px").css("left", (o.navOffset + o.margin[3]) + "px").css("right", "auto");
					e.addClass("partial left");

					el.toggleClass("active", e.hasClass("active"));

					revealWidth = Math.abs(eWidth - (eOffset - o.container.offset().left));
					if (diff >= o.ellWidth) {
						if ((eWidth - revealWidth - o.liPad < o.ellWidth)) {
							el.addClass("transparent");
							e.css("visibility", "hidden");
						}
					} else {
						e.css("visibility", "hidden");
						el.css({top: "-10000px", left: "-10000px", right: "inherit"});
					}
					e.attr("rel", revealWidth);
				} else {
					e.addClass("hidden");
				}

			}

			a = Math.ceil(e.offset().left) + Math.ceil(e.outerWidth(true)); // element's (li) left offset plus its width
			b = cOffset;
			diff = Math.abs(a - b);

			// Partially hidden Tab is to the right
			if (a > b && diff > o.liPad) {

				eWidth = Math.ceil(e.outerWidth(true));
				eOffset = Math.ceil(e.offset().left) + eWidth;

				c = eWidth + cOffset;
				d = eOffset;
				diff = Math.abs(c - d);

				if ((c > d) && (diff > 1)) {

					el = o.wrapper.find(".tab-ellipsis.right");
					el.css({top: "1px", right: (o.navOffset + o.margin[1]) + "px", left: "inherit"});

					e.addClass("partial right");

					el.toggleClass("active", e.hasClass("active"));

					revealWidth = Math.ceil(Math.abs(eWidth - eWidth + cOffset - eOffset));
					revealWidth = revealWidth - 9;

					if (diff >= o.ellWidth) {
						if ((eWidth - revealWidth) < el.outerWidth(true)) {
							el.addClass("transparent");
							e.css("visibility", "hidden");
						}
					} else if (diff < e.ellWidth && diff > 2) {
						e.css("visibility", "hidden");
						el.css({top: "1px", left: "inherit", right: (o.navOffset - (ellWidth - diff)) + "px"}).addClass("transparent");
					} else {
						e.css("visibility", "hidden");
						el.css({top: "-10000px", left: "-10000px", right: "inherit"});
					}
					e.attr("rel", revealWidth);
				} else {
					e.addClass("hidden");
				}
			}
		});

		o.nav.find(".last, .forward").toggleClass("disabled", (!last.hasClass("partial")) && (!last.hasClass("hidden")));
		o.nav.find(".first, .back").toggleClass("disabled", (!first.hasClass("partial")) && (!first.hasClass("hidden")));
	}
};
