import React, { useEffect, useRef } from 'react';

export default function LiveBackground() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    // Resize canvas
    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        initParticles();
      }
    };

    // Track mouse position
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    // Particle template
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1; // particle size
        this.baseSpeedX = (Math.random() - 0.5) * 0.4;
        this.baseSpeedY = (Math.random() - 0.5) * 0.4;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        
        // Randomly assign one of our thematic colours: Teal, Cyan, or Rose
        const colors = [
          'rgba(13, 148, 136, 0.45)', // Teal
          'rgba(6, 182, 212, 0.45)',  // Cyan
          'rgba(244, 63, 94, 0.35)',  // Rose
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        // Handle mouse interaction (subtle attraction)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            // Move slightly towards mouse
            this.speedX += (dx / distance) * force * 0.05;
            this.speedY += (dy / distance) * force * 0.05;
            
            // Limit speed
            const maxSpeed = 1.2;
            const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (speed > maxSpeed) {
              this.speedX = (this.speedX / speed) * maxSpeed;
              this.speedY = (this.speedY / speed) * maxSpeed;
            }
          } else {
            // Decelerate back to base speed
            this.speedX += (this.baseSpeedX - this.speedX) * 0.02;
            this.speedY += (this.baseSpeedY - this.speedY) * 0.02;
          }
        } else {
          // Decelerate back to base speed
          this.speedX += (this.baseSpeedX - this.speedX) * 0.02;
          this.speedY += (this.baseSpeedY - this.speedY) * 0.02;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off borders
        if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
      }
    }

    const initParticles = () => {
      particles = [];
      // Dynamic density based on canvas area
      const numberOfParticles = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < numberOfParticles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const drawLines = () => {
      for (let a = 0; a < particles.length; a++) {
        // Lines to other particles
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            const opacity = (1 - distance / 110) * 0.15;
            ctx.strokeStyle = `rgba(13, 148, 136, ${opacity})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }

        // Lines to mouse pointer
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[a].x - mouse.x;
          const dy = particles[a].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const opacity = (1 - distance / mouse.radius) * 0.25;
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      
      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Attach events and initialize
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 live-wallpaper"
    >
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full opacity-60 pointer-events-auto"
      />
    </div>
  );
}
