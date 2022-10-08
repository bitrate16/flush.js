/*
flush.js - flush on the the page
Copyright (C) 2022  bitrate16

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

https://github.com/bitrate16/flush.js
*/

// Flush emojee. 
// duration - defines the length of the animation in total. Default is null (infinite)
// pps - defines particles per second spawn ratio. Default is 1
// size - defines emojee size (unit of vmin). Default is 1
// fps - target fps
// gravityY - target gravity (unit of vh)
// baseSpeedX - starting speed of particle (unit of vw)
// baseSpeedY - starting speed of particle (unit of vy)
// emojee - emojee to yeet with
// dimension - defines the target dimension (max or min) of vmax, vmin
function flushEmojee({duration=null, pps=1, size=1, fps=30, gravityY=1, baseSpeedY=10, baseSpeedX=10, emojee='💩', dimension='vmin'} = {}) {
	
	if (duration !== null)
		duration *= 1000;
	
	// Viewport
	var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
	var vmix;
	if (dimension === 'vmax')
		vmix = Math.max(vw, vh);
	else if (dimension === 'vmin')
		vmix = Math.min(vw, vh);
	else
		throw new Error('Invalid dimension');
	
	var resizeKeeper = function() {
		console.log('resize');
		vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
		if (dimension === 'vmax')
			vmix = Math.max(vw, vh);
		else if (dimension === 'vmin')
			vmix = Math.min(vw, vh);
		else
			throw new Error('Invalid dimension');
	};
	
	window.addEventListener('resize', resizeKeeper);
	
	// List of particles (element, speedY)
	var particles = [];
	var timestamp = Date.now();
	
	window.particles = particles;
	
	var overlay = document.createElement('div');
	overlay.style.position = 'fixed';
	overlay.style.top = 0;
	overlay.style.left = 0;
	overlay.style.width = '100vw';
	overlay.style.height = '100vh';
	overlay.style.pointerEvents = 'none';
	overlay.style.userSelect = 'none';
	overlay.style.overflow = 'hodden';
	overlay.style.zIndex = 9998;
	
	const particleTemplate = document.createElement('div');
	particleTemplate.style.position = 'absolute';
	particleTemplate.style.width = `${ size }${ dimension }`;
	particleTemplate.style.height = `${ size }${ dimension }`;
	particleTemplate.style.fontSize = `${ size }${ dimension }`;
	particleTemplate.style.zIndex = 9999;
	particleTemplate.style.userSelect = 'none';
	particleTemplate.style.pointerEvents = 'none';
	particleTemplate.style.transformOrigin = 'center';
	
	document.body.appendChild(overlay);
	
	// Spawner
	var spawnInterval = setInterval(function() {
		
		// Create element & properties
		let particle = {
			elem: document.createElement('div'),
			positionX: Math.random() * vw - size * vmix * 0.01 * 0.5,
			positionY: -size * vmix * 0.02,
			speedX: (Math.random() - 0.5) * 2 * baseSpeedX * vw * 0.01,
			speedY: Math.random() * baseSpeedY * vh * 0.01,
			rotation: Math.random() * 360,
			rotationSpeed: (Math.random() - 0.5) * 90
		};
		
		if (particle.positionX > (vw - size * vmix * 0.01) && particle.speedX > 0)
			particle.speedX = -particle.speedX;
		
		if (particle.positionX < size * vmix * 0.01 && particle.speedX < 0)
			particle.speedX = -particle.speedX;
		
		// Configure element
		particle.elem = particleTemplate.cloneNode();
		particle.elem.style.left = `${ particle.positionX }px`;
		particle.elem.style.top = `-${ particle.positionY }px`;
		particle.elem.style.transform = `rotate(${ particle.rotation }deg)`;
		particle.elem.textContent = emojee;
		
		overlay.appendChild(particle.elem);
		particles.push(particle);
		
		if (duration !== null && (timestamp + duration < Date.now()))
			clearInterval(spawnInterval);
		
	}, 1.0 / pps * 1000);
	
	// Animator
	var lastTS = Date.now();
	const invFPS = 0.001 / fps;
	var animator = function() {
		
		// Timestamp
		let delta = (Date.now() - lastTS) * 0.001;
		
		// No update if over fps
		if (delta < invFPS) {
			requestAnimationFrame(animator);
			return;
		}
		
		let _particles = particles.filter(function(particle) {
			if (particle.positionY > vh || particle.positionX > vw || particle.positionX < -vw * size) {
				overlay.removeChild(particle.elem);
				delete particle.elem;
				return false;
			}
			
			// Update state
			particle.speedY += gravityY * vh * delta;
			particle.positionX += particle.speedX * delta;
			particle.positionY += particle.speedY * delta;
			particle.rotation += Math.round(particle.rotationSpeed * delta);
			
			particle.rotation = ((particle.rotation % 360) + 360) % 360;
			
			// Update DOM
			particle.elem.style.top = `${ particle.positionY }px`;
			particle.elem.style.left = `${ particle.positionX }px`;
			particle.elem.style.transform = `rotate(${ particle.rotation }deg)`;
			
			return true;
		});
		delete particles;
		particles = _particles;
		
		lastTS = Date.now();
		
		// Update if limited and empty
		if (!(duration !== null && (timestamp + duration < Date.now()) && particles.length === 0))
			requestAnimationFrame(animator);
		else
			window.removeEventListener('resize', resizeKeeper);
	};
	
	requestAnimationFrame(animator);
};
