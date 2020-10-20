{% raw -%}
	{{#each values}}
		<a href="" onclick="getprivatemessage('{{this}}')">
			<div class="private-members-list" id="{{this}}">
				{{this}}
			</div>
		</a>
	{{/each}}
{%- endraw %}
