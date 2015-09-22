<?php
if(isset($_GET['page'])) $page = $_GET['page'];
else $page = "index";
?>
<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Ajax Test - <?php echo $page; ?></title>
		<link rel="stylesheet" href="ajax.css">
	</head>
	<body>
		<nav id="planets">
			<ul>
				<?php
					$planets = array("Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune");
					foreach($planets as $p) {
						echo '<li><a class="ajax" href="?page=' . $p . '">' . $p . '</a></li>';
					}
				?>
			</ul>
		</nav>
		<main class="<?php echo $page; ?>">

			<?php
				echo "<h1>" . $page . "</h1>";
				for($x = 1;$x<11;$x++) {
					echo "<h2>" . $x . "</h2><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>";
				}
			?>
			
		</main>

		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
		<script src="ajax.js"></script>
		<script>
			$(function() {

				var menu = {
					selectActive: function(url) {
						$('#planets li.active').removeClass('active');
						var a = $('#planets a[href="'+url.replace(/\//,'')+'"]');
						if(a.length) a.parent().addClass('active');						
					},
				};
				var ajax = new Ajax({menu: menu,root: 'http://localhost/'});
				
			});
		</script>
	</body>
</html>