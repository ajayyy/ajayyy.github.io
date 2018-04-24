//"in" attributes from our vertex shader
varying vec4 vColor;
varying vec2 vTexCoord;

//declare uniforms
uniform sampler2D u_texture;
uniform float resolution;
uniform vec2 dir;

void blur() {
	vec4 ocolor = texture2D(u_texture, vTexCoord) * vColor;
	
	vec4 color = vec4(0.0);
	vec2 off1 = vec2(1.411764705882353) * dir;
	vec2 off2 = vec2(3.2941176470588234) * dir;
	vec2 off3 = vec2(5.176470588235294) * dir;
	color += texture2D(u_texture, vTexCoord) * 0.1964825501511404;
	color += texture2D(u_texture, vTexCoord + (off1 / resolution)) * 0.2969069646728344;
	color += texture2D(u_texture, vTexCoord - (off1 / resolution)) * 0.2969069646728344;
	color += texture2D(u_texture, vTexCoord + (off2 / resolution)) * 0.09447039785044732;
	color += texture2D(u_texture, vTexCoord - (off2 / resolution)) * 0.09447039785044732;
	color += texture2D(u_texture, vTexCoord + (off3 / resolution)) * 0.010381362401148057;
	color += texture2D(u_texture, vTexCoord - (off3 / resolution)) * 0.010381362401148057;
	
	gl_FragColor = color;
}

void main() {
	blur();
}