import React, { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  type: "petal" | "firefly" | "sparkle" | "heart";
  sizeModifier: number;
  rotation: number;
  rotationSpeed: number;
  pulseSpeed?: number;
  pulsePhase?: number;
}

export default function SootheCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle Resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize particles
    const initParticles = () => {
      const temp: Particle[] = [];
      
      // Add falling cherry blossom petals
      for (let i = 0; i < 45; i++) {
        temp.push(createParticle(true, "petal"));
      }

      // Add floating warm fireflies (sparkles)
      for (let i = 0; i < 35; i++) {
        temp.push(createParticle(true, "firefly"));
      }

      particlesRef.current = temp;
    };

    const createParticle = (randomY = false, forceType?: "petal" | "firefly" | "sparkle" | "heart", clickX?: number, clickY?: number): Particle => {
      const type = forceType || (Math.random() > 0.6 ? "petal" : "firefly");
      const r = Math.random();

      // Petals sway and fall, fireflies hover/pulse, sparkles appear on click
      let px = clickX !== undefined ? clickX : Math.random() * width;
      let py = clickY !== undefined ? clickY : (randomY ? Math.random() * height : -10);
      
      let vx = 0;
      let vy = 0;
      let radius = 0;
      let color = "";

      if (type === "petal") {
        vx = Math.random() * 0.8 - 0.4 + 0.3; // slightly drifting right due to wind
        vy = Math.random() * 1.0 + 0.6; // falling down
        radius = Math.random() * 4 + 3;
        // delicate, soft pink tones
        const pinkShade = Math.floor(Math.random() * 40) + 215; // 215-255
        const redShade = Math.floor(Math.random() * 30) + 225; // 225-255
        color = `rgba(${redShade}, ${pinkShade - 60}, ${pinkShade - 40}`; // pink hue
      } else if (type === "firefly") {
        vx = Math.random() * 0.6 - 0.3;
        vy = Math.random() * 0.4 - 0.2 - 0.1; // slow float upwards
        radius = Math.random() * 2.5 + 1.2;
        // soft glow amber pink / warm magenta
        color = Math.random() > 0.5 ? "255, 120, 180" : "255, 180, 220";
      } else if (type === "heart") {
        // slowly ascending trailing translucent hearts
        vx = (Math.random() - 0.5) * 0.6;
        vy = (Math.random() * -0.4) - 0.35; // gently floating upward
        radius = Math.random() * 4.5 + 3.0; // small cute hearts
        color = "244, 63, 94"; // rose pink color
      } else {
        // sparkle from custom click
        vx = (Math.random() - 0.5) * 4;
        vy = (Math.random() - 0.5) * 4 - 0.5;
        radius = Math.random() * 3 + 1.5;
        color = "255, 230, 240";
      }

      return {
        x: px,
        y: py,
        vx,
        vy,
        radius,
        alpha: type === "sparkle" ? 1.0 : type === "heart" ? Math.random() * 0.3 + 0.3 : Math.random() * 0.5 + 0.3,
        color,
        type,
        sizeModifier: Math.random() * 0.4 + 0.8,
        rotation: (Math.random() - 0.5) * 0.5, // slightly tilted hearts or petals
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        pulseSpeed: type === "firefly" ? Math.random() * 0.02 + 0.01 : undefined,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    };

    initParticles();

    // Mouse movement listeners
    let lastX = -1000;
    let lastY = -1000;

    const trackAndSpawnHeart = (clientSeqX: number, clientSeqY: number) => {
      if (lastX === -1000) {
        lastX = clientSeqX;
        lastY = clientSeqY;
        return;
      }

      const dist = Math.hypot(clientSeqX - lastX, clientSeqY - lastY);
      if (dist > 30) { // spawn every 30 pixels traveled
        const newHeart = createParticle(false, "heart", clientSeqX, clientSeqY);
        particlesRef.current.push(newHeart);
        
        // Keep particles within check limit
        if (particlesRef.current.length > 200) {
          particlesRef.current.shift();
        }

        lastX = clientSeqX;
        lastY = clientSeqY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      trackAndSpawnHeart(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        mouseRef.current.targetX = touchX;
        mouseRef.current.targetY = touchY;
        trackAndSpawnHeart(touchX, touchY);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
      lastX = -1000;
      lastY = -1000;
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      // Spawn burst of sparkles
      const newSparkles: Particle[] = [];
      for (let i = 0; i < 15; i++) {
        newSparkles.push(createParticle(false, "sparkle", clickX, clickY));
      }
      particlesRef.current = [...particlesRef.current, ...newSparkles];
      if (particlesRef.current.length > 150) {
        particlesRef.current.splice(0, 15); // cap particles
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseout", handleMouseLeave);
    canvas.addEventListener("click", handleCanvasClick);

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Create a gentle dark-to-pink vignette gradient backdrop
      const centerGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      centerGlow.addColorStop(0, "#1c141a"); // warm dark rich magenta-tinted charcoal
      centerGlow.addColorStop(1, "#0d0a0d"); // deep quiet black
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // Ease the actual mouse reference towards the target
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const currentParticles = particlesRef.current;

      for (let i = 0; i < currentParticles.length; i++) {
        const p = currentParticles[i];

        // Interaction with mouse cursor (repulsion physics)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          const force = (180 - dist) / 180;
          const forceX = (dx / dist) * force * 1.5;
          const forceY = (dy / dist) * force * 1.5;
          p.x += forceX;
          p.y += forceY;
        }

        if (p.type === "petal") {
          // Petal physics
          p.x += p.vx + Math.sin(p.rotation) * 0.2; // soft sway
          p.y += p.vy;
          p.rotation += p.rotationSpeed;

          // Wrap around screen bounds
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) {
            p.x = -20;
          } else if (p.x < -20) {
            p.x = width + 20;
          }

          // Draw blooming petal (soft oval-like cherry leaf)
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color + `, ${p.alpha})`;
          ctx.beginPath();
          // Draw a heart-shaped / tear-shaped petal
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.radius, -p.radius * 1.5, -p.radius * 2, p.radius * 0.5, 0, p.radius * 1.8);
          ctx.bezierCurveTo(p.radius * 2, p.radius * 0.5, p.radius, -p.radius * 1.5, 0, 0);
          ctx.closePath();
          ctx.fill();

          // Add a soft white/pink highlight
          ctx.fillStyle = "rgba(255, 235, 242, 0.4)";
          ctx.beginPath();
          ctx.ellipse(-p.radius * 0.3, 0, p.radius * 0.2, p.radius * 0.6, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();

        } else if (p.type === "firefly") {
          // Firefly float physics
          p.x += p.vx;
          p.y += p.vy;
          
          // Slight pendulum movement
          p.pulsePhase! += p.pulseSpeed!;
          p.alpha = (Math.sin(p.pulsePhase!) * 0.4 + 0.6) * 0.8;

          // Wrap boundaries
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;

          // Draw firefly with glowing halo
          ctx.save();
          
          // Glow halo
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
          glow.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
          glow.addColorStop(0.3, `rgba(${p.color}, ${p.alpha * 0.4})`);
          glow.addColorStop(1, `rgba(${p.color}, 0)`);
          
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();

        } else if (p.type === "sparkle") {
          // Sparkle slowly fades away and drops speed
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.alpha -= 0.015;

          if (p.alpha <= 0) {
            // Remove faded sparkles
            currentParticles.splice(i, 1);
            i--;
            continue;
          }

          // Draw cross-shaped star sparkle
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle rays
          ctx.strokeStyle = `rgba(255, 240, 245, ${p.alpha * 0.7})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-p.radius * 3, 0);
          ctx.lineTo(p.radius * 3, 0);
          ctx.moveTo(0, -p.radius * 3);
          ctx.lineTo(0, p.radius * 3);
          ctx.stroke();

          ctx.restore();
        } else if (p.type === "heart") {
          // Heart slowly rises, sways, and fades out gracefully
          p.x += p.vx + Math.sin(p.rotation) * 0.15;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.alpha -= 0.006; // beautiful long-lasting trail

          if (p.alpha <= 0) {
            currentParticles.splice(i, 1);
            i--;
            continue;
          }

          // Draw a soft translucent heart shape on canvas
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          
          ctx.beginPath();
          const size = p.radius;
          ctx.moveTo(0, -size * 0.25);
          // Left lobe
          ctx.bezierCurveTo(-size * 0.5, -size * 0.85, -size * 1.2, -size * 0.2, 0, size * 0.8);
          // Right lobe
          ctx.bezierCurveTo(size * 1.2, -size * 0.2, size * 0.5, -size * 0.85, 0, -size * 0.25);
          ctx.closePath();
          ctx.fill();

          // Add subtle inner candle highlight to look glossy and beautiful
          ctx.fillStyle = `rgba(255, 230, 240, ${p.alpha * 0.45})`;
          ctx.beginPath();
          ctx.ellipse(-size * 0.2, -size * 0.2, size * 0.1, size * 0.2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      if (canvas) {
        canvas.removeEventListener("click", handleCanvasClick);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-auto z-0"
      id="comfort-canvas-background"
    />
  );
}
