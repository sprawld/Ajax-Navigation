// ------------------
//    Ajax Navigation
// ------------------

// Requires: History.js, jQuery

function Ajax(opts) {
	this.init(opts);
}


Ajax.prototype = {
	
	// data
	
	state: {
		url: History.getState().url,
		pos: 0,
		count: 0,
		transition:false,
		next: false,
	},
	scrollTop: [],
	main: $('main'),
	history: {},
	css: [],
	plugins: [],
	scripts: {},


	// init
	init: function(opts) {
		
		// Options: menu (a menu function, with 3 functions: setActive(url), setMain(main window), setClick(function load(url))
		// 			root (the root domain for all ajax pages)
		var self = this;
		var url = this.state.url;
		this.root = opts.root || "";
		this.menu = $.extend({
			selectActive: function() {},
			setMain: function() {},
			setClick: function() {},
		},opts.menu || {});
		
		if(opts.parameter) this.ajaxParameter = opts.parameter;
		else this.ajaxParameter = null;
		
		// Get initial page data - names of CSS & Javascript  (page-specific and plugins)
		var pageData = self.find($('html'));
		this.plugins = pageData.js.plugins.map(function(a) {
			return a[0];
		});
		this.css = pageData.css;
		self.get({js:pageData.js.scripts},function(text) {
			//load the page-specific javascript, to run again if you return to this page
			var jsFull = text.js.map(function(a) {
				return a[1];
			});
			//save page in the history,
			self.history[url] = {
				html:self.main.html(),
				scroll: 0,
				type: self.main.attr('class'),
				js: jsFull,
			};
			
		});
			
			History.replaceState({state:0},null,url);			
			$.ajaxSetup({
			  cache: true
			});

		$('body').on('click','a.ajax',function(e) {
			e.preventDefault();
			e.stopPropagation();
			self.load($(this));
		});

		self.menu.setClick(function(a) {
			self.load(a)
		});

		History.Adapter.bind(window,'statechange',function() {
			self.change();
		});
		
	},

	// methods
	load: function(obj) {
		var self = this;
		self.scrollTop[self.state.pos] = [self.state.url,self.main.scrollTop()];
		self.state.pos++;	
		var url = obj.attr('href');
		History.pushState({state:self.state.pos},null,url);	
	},


	find: function(page) {
		// Scan page for CSS & Javascript files
		var self = this;
		
		var css = page.find('link[rel="stylesheet"]').map(function() { return $(this).attr('href'); }).get();
		var style = page.find('style').map(function() { return $(this).html(); }).get().join('');

		var js = {
			scripts: [],
			plugins: [],
		};
		
		page.find('script[data-page], script[data-plugin]').each(function() {
			var a = $(this),
				b = a.attr('src'),
				c = a.attr('data-plugin') == undefined;
			if(c) {
				// page
				if(b == undefined) js.scripts.push(['',a.html()]);
				else if(self.scripts[b]) js.scripts.push([b,self.scripts[b]]);
				else return js.scripts.push([b]);			
			} else {
				if(b == undefined) js.plugins.push(['',a.html()]);
				if(self.plugins.indexOf(b) == -1) js.plugins.push([b]);
			}
		});
		return {css:css,style:style,js:js};
	},

	get: function(obj, callback) {
		//ajax download all files (CSS & Javascript) as text
		var length = 0, count = 0;
		$.each(obj, function(type, list) { length += list.length; });
		if(length==0) callback(obj);
		else $.each(obj, function(type, list) {
			list.forEach(function(a,b) {
				if(a.length == 1) {
					$.ajax({
						dataType: 'text',
						url: a[0],
					}).done(function(data) {
						obj[type][b].push(data);
					}).fail(function(error) {
						obj[type][b].push("");
					}).always(function() {
						if(++count == length) callback(obj);
					});
				} else {
					if(++count == length) callback(obj);
				}
			});
		});	
	},

	change: function() {
		var self = this;
		var state = History.getState(),
			pos = state.data.state,
			url = state.url,
			oldPos = self.state.pos,
			oldURL = self.state.url;

			
		// Asynchronous flags, if this function's previous call hasn't completed,
		// wait before completing
		if(self.state.transition) {
			self.state.next = true;
			return;
		}
		self.state.transition = true;
		if(url.match(self.root)) self.menu.selectActive(url.replace(self.root,""));

		var old = self.main;
		var getNext = function() {
			self.state.transition = false;
			if(self.state.next) {
				self.state.next = false;
				self.change();
			}
		};
		var checkNext = setTimeout(getNext,1000);
		
		// Timer - currently pages are set to fade out in 500ms.
		var startTime = new Date();
		self.scrollTop[self.state.pos] = [self.state.url,old.scrollTop()];

		var page = $('<main class="hide"></main>');
		$('body').append(page);
		self.main = page;
		
		if(!self.history.hasOwnProperty(url)) {
			// page is not in history, load
			var ajaxURL = self.ajaxParameter ? url.replace(/$/,'?'+self.ajaxParameter) : url;
			old.addClass('hide');
			$.ajax({
				url: ajaxURL,
				dataType: 'text',
			}).done(function(data) {
				var css = [], stylesheets = [];
				var dataObj = $('<block>'+data+'</block>'),
					htmlObj = dataObj.find('main'),
					htmlClass = htmlObj.attr('class'),
					html = htmlObj.html();
				if(htmlObj.length) {
					//add page and load javascript & CSS
					page.html(html).addClass(htmlClass);
					var pageInfo = self.find(dataObj);
					self.get(pageInfo.js, function(js) {
						
						var head = pageInfo.css.map(function(a) {
							if(self.css.indexOf(a) == -1) {
								self.css.push(a);
								return '@import "'+a+'";';
							} else return '';
						}).join('\n') + pageInfo.style;
						var jsAll = js.scripts.map(function(a) {
							if(a[0] && !self.scripts.hasOwnProperty(a[0])) self.scripts[a[0]] = a[1];
							return a[1];
						}).join(';');
						var pluginAll = js.plugins.map(function(a) {
							if(a[0] && self.plugins.indexOf(a[0]) == -1) self.plugins.push(a[0]);
							return a[1];
						}).join(';');					
						
						// Add page data to history
						self.history[url] = {html:html,js:jsAll,type:htmlClass};
						// run plugins
						$.globalEval(pluginAll);
						// add CSS
						var style = document.createElement('style');
						style.textContent = head;
						$('head').append(style);
						// wait until CSS loads
						var checkCSS = setInterval(function() {
							try {
								style.sheet.cssRules; // <--- MAGIC: only populated when file is loaded
								clearInterval(checkCSS);
								var gap = 500 - (new Date() - startTime);gap = gap < 0 ? 0 : gap;
								setTimeout(function() {
									old.remove();
									if(self.state.next && checkNext) {
										//Asynchronous - if there's another transition waiting, don't show the page
										clearTimeout(checkNext);
										getNext();
									} else {
										//run page specific code
										$.globalEval(jsAll);
										page.removeClass('hide').focus();											
										self.menu.setMain( page );
									}
								},gap);
							} catch (e){}
						}, 10);  
					});
				} else { 
					var gap = 500 - (new Date() - startTime);gap = gap < 0 ? 0 : gap;
					setTimeout(function() {
						old.remove();
						page.addClass('error').removeClass('hide');
					},gap);
				}
				//ajax.history[url].css = css.join('');
			}).fail(function(error) {
				//zonsole.log('ajax error '+error);
				var gap = 500 - (new Date() - startTime);gap = gap < 0 ? 0 : gap;
				setTimeout(function() {
					old.remove();
					page.addClass('error').removeClass('hide');
				},gap);
			});
		} else {
			// page is in history, no need to reload it
			var html = self.history[url].html;
			var type = self.history[url].type;
			if(pos < self.state.pos) {
				//back
				old.addClass('right');
				page.addClass('left '+type);
			} else if(pos > self.state.pos) {
				//forwards
				old.addClass('left');
				page.addClass('right '+type);
			} else {
				//cached, but loaded;
				old.addClass('hide');
				page.addClass(type);
			}
			page.html(html);
			var gap = 500 - (new Date() - startTime);gap = gap < 0 ? 0 : gap;
			setTimeout(function() {
				if(self.state.next && checkNext) {
					//Asynchronous
					clearTimeout(checkNext);
					getNext();
				} else {
					old.remove();
					$.globalEval(self.history[url].js);
					if(self.scrollTop[pos] && self.scrollTop[pos][0] == url) page.scrollTop(self.scrollTop[pos][1]);
					page.removeClass('hide left right').focus();
					self.menu.setMain( page );
				}
			},gap);
		}
		self.state.pos = pos;
		self.state.url = url;
		
	},	
};
	
