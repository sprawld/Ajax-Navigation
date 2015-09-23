# Ajax-Navigation

An ajax navigation plugin. Allows:

- Smooth transition between pages, with different transitions for loading a link, back and forward button.
- Page HTML and Javascript cached
- Scroll position retained (without jumps when using the back button)

Basic setup:

```html
<html>
	<head>
		<link rel="stylesheet" href="style.css">
	</head>
	<body>

		<main>
			<!-- Page Contents -->
		</main>

		<script src="jquery.js"></script>
		<script src="ajax.js"></script>

		<script data-plugin src="plugins.js"></script>
		<script data-page src="main.js"></script>
		<script>
			$(function() {
				var ajax = new Ajax({root: "http://sprawledoctopus.com/"});
			});
		</script>
	</body>
</html>
```

Page contents is put inside a `<main>` block, rather than stright inside the `<body>`.
The demo page gives an example CSS for the main block, and page transitions.
This stops a problem that occurs when clicking on back or forward buttons that jumps the page to the previous scroll position.

When loaded by ajax, only scripts with `data-plugin` and `data-page` attributes are run.
Plugins are only run once, page scripts are run each time the page is displayed.
Stylesheets will also be loaded only once.
